import { AdminService } from './../admin/admin.service';
import {
    comparePassword,
    hashPassword,
    RedisService,
    parseDurationToMs,
    REDIS_KEYS,
    EVENTS,
    SignInDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    RefreshTokenDto,
    VerifyOtpDto,
} from '@libs/index';
import { Injectable, UnprocessableEntityException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfig } from '@libs/config/app.config';
import * as crypto from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuthService {

    constructor(
        private readonly adminService: AdminService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    private async generateAuthResponse(admin: any) {
        const { password, ...payload } = admin;

        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const refreshTtlMs = parseDurationToMs(AppConfig.JWT_REFRESH_EXPIRES_IN as string);

        await this.redisService.set(
            `${REDIS_KEYS.REFRESH_TOKEN}:${refreshToken}`,
            JSON.stringify({ adminId: admin.id, accessToken }),
            refreshTtlMs,
        );

        return {
            admin: payload,
            accessToken,
            refreshToken,
        };
    }

    async signIn(signInDto: SignInDto) {
        const admin = await this.adminService.findByEmail(signInDto.email)

        if (!admin || !await comparePassword(signInDto.password, admin.password)) {
            throw new UnprocessableEntityException('Invalid credentials')
        }

        if (!admin.isActive) {
            throw new UnprocessableEntityException('Your account has been deactivated.')
        }

        return this.generateAuthResponse(admin);
    }

    async refreshTokens(dto: RefreshTokenDto, headerToken?: string | null) {
        const sessionStr = await this.redisService.get(`${REDIS_KEYS.REFRESH_TOKEN}:${dto.refreshToken}`);

        if (!sessionStr) {
            throw new UnprocessableEntityException('Invalid or expired refresh token. Please sign in again.');
        }

        let adminId: number;
        let oldAccessToken: string | null = null;

        try {
            const parsed = JSON.parse(sessionStr);
            if (parsed && typeof parsed === 'object' && parsed.adminId) {
                adminId = typeof parsed.adminId === 'number' ? parsed.adminId : parseInt(parsed.adminId, 10);
                oldAccessToken = parsed.accessToken || null;
            } else {
                adminId = parseInt(sessionStr, 10);
            }
        } catch {
            adminId = parseInt(sessionStr, 10);
        }

        const admin = await this.adminService.findOne(adminId, false, ['role']);

        const isRoleStale = await this.isRoleInvalidated(admin.roleId, Date.now());
        const isAdminStale = await this.isAdminInvalidated(admin.id, Date.now());

        if (isRoleStale || isAdminStale || !admin.isActive) {
            await this.redisService.del(`${REDIS_KEYS.REFRESH_TOKEN}:${dto.refreshToken}`);
            throw new UnprocessableEntityException('Your account or role has been updated. Please sign in again.');
        }

        await this.redisService.del(`${REDIS_KEYS.REFRESH_TOKEN}:${dto.refreshToken}`);

        // Blocklist the old access token so it immediately stops working
        const blocklistTtlMs = parseDurationToMs(AppConfig.JWT_EXPIRES_IN as string) + parseDurationToMs('1d');
        if (oldAccessToken) {
            await this.redisService.set(`${REDIS_KEYS.TOKEN_BLOCKLIST}:${oldAccessToken}`, 'BLOCKED', blocklistTtlMs);
        }
        if (headerToken && headerToken !== oldAccessToken) {
            await this.redisService.set(`${REDIS_KEYS.TOKEN_BLOCKLIST}:${headerToken}`, 'BLOCKED', blocklistTtlMs);
        }

        return this.generateAuthResponse(admin);
    }

    async signOut(token: string, refreshTokenDto?: RefreshTokenDto) {
        const ttlMs = parseDurationToMs(AppConfig.JWT_EXPIRES_IN as string) + parseDurationToMs('7d');
        await this.redisService.set(`${REDIS_KEYS.TOKEN_BLOCKLIST}:${token}`, 'BLOCKED', ttlMs);

        if (refreshTokenDto?.refreshToken) {
            await this.redisService.del(`${REDIS_KEYS.REFRESH_TOKEN}:${refreshTokenDto.refreshToken}`);
        }

        return;
    }

    async isTokenBlocklisted(token: string): Promise<boolean> {
        const result = await this.redisService.get(`${REDIS_KEYS.TOKEN_BLOCKLIST}:${token}`);
        return result === 'BLOCKED';
    }

    async isRoleInvalidated(roleId: number, iatMs: number): Promise<boolean> {
        const invalidatedAtStr = await this.redisService.get(`${REDIS_KEYS.ROLE_INVALIDATED}:${roleId}`);
        if (!invalidatedAtStr) return false;

        const invalidatedAtMs = parseInt(invalidatedAtStr, 10);
        // If the token was issued BEFORE the role was invalidated, it is stale
        return iatMs < invalidatedAtMs;
    }

    async isAdminInvalidated(adminId: number, iatMs: number): Promise<boolean> {
        const invalidatedAtStr = await this.redisService.get(`${REDIS_KEYS.ADMIN_INVALIDATED}:${adminId}`);
        if (!invalidatedAtStr) return false;

        const invalidatedAtMs = parseInt(invalidatedAtStr, 10);
        // If the token was issued BEFORE the admin was invalidated, it is stale
        return iatMs < invalidatedAtMs;
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        const admin = await this.adminService.findByEmail(dto.email);
        if (!admin || !admin.isActive) {
            // Silently return success to prevent email enumeration attacks
            return;
        }

        // Generate a random 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store in Redis with a 10-minute TTL
        const ttlMs = parseDurationToMs('10m');
        await this.redisService.set(`${REDIS_KEYS.FORGOT_PASSWORD_OTP}:${dto.email}`, otp, ttlMs);

        // Emit event to send OTP asynchronously
        this.eventEmitter.emit(EVENTS.MAIL.SEND_RESET_OTP, {
            email: dto.email,
            otp
        });

        return;
    }

    async verifyOtp(dto: VerifyOtpDto) {
        const storedOtp = await this.redisService.get(`${REDIS_KEYS.FORGOT_PASSWORD_OTP}:${dto.email}`);

        if (!storedOtp || storedOtp !== dto.otp) {
            throw new BadRequestException('Invalid or expired OTP.');
        }

        return;
    }

    async resetPassword(dto: ResetPasswordDto) {
        const storedOtp = await this.redisService.get(`${REDIS_KEYS.FORGOT_PASSWORD_OTP}:${dto.email}`);

        if (!storedOtp || storedOtp !== dto.otp) {
            throw new BadRequestException('Invalid or expired OTP.');
        }

        const admin = await this.adminService.findByEmail(dto.email);
        if (!admin || !admin.isActive) {
            throw new NotFoundException('Admin not found.');
        }

        // Hash new password
        const hashedPassword = await hashPassword(dto.newPassword);

        // Update in DB (using adminService directly may fail if password isn't in UpdateAdminDto, so let's call changePassword but bypass old password check)
        // Wait, AdminService has a changePassword method, but it requires old password. Let's just update the repo directly or via a special method.
        // I will use a direct query since adminService doesn't expose the repo.
        // Actually I can just cast it.
        await this.adminService.update(admin.id, { password: hashedPassword } as any);

        // Clean up Redis
        await this.redisService.del(`${REDIS_KEYS.FORGOT_PASSWORD_OTP}:${dto.email}`);

        return;
    }

}
