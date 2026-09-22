import { ClientService } from '../client/client.service';
import {
    RedisService,
    parseDurationToMs,
    REDIS_KEYS,
    RefreshTokenDto,
} from '@libs/index';
import { Injectable, UnprocessableEntityException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfig } from '@libs/config/app.config';
import * as crypto from 'crypto';
import { RegisterClientDto } from './dto/register-client.dto';
import { ClientSignInDto } from './dto/client-sign-in.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';

@Injectable()
export class AuthService {

    constructor(
        private readonly clientService: ClientService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) { }

    private async generateAuthResponse(user: any) {
        const { password, ...payload } = user;

        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const refreshTtlMs = parseDurationToMs(AppConfig.JWT_REFRESH_EXPIRES_IN as string);

        await this.redisService.set(
            `${REDIS_KEYS.REFRESH_TOKEN}:${refreshToken}`,
            JSON.stringify({ userId: user.id, accessToken }),
            refreshTtlMs,
        );

        return {
            client: payload,
            accessToken,
            refreshToken,
        };
    }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    }

    async register(registerDto: RegisterClientDto) {
        const otp = this.generateOtp();
        const ttlMs = parseDurationToMs('10m'); // 10 minutes to verify

        const sessionData = {
            otp,
            name: registerDto.name,
        };

        await this.redisService.set(`${REDIS_KEYS.CLIENT_REGISTER_OTP}:${registerDto.phone}`, JSON.stringify(sessionData), ttlMs);

        // For now, return the OTP in the response
        return { otp };
    }

    async verifyRegisterOtp(dto: VerifyOtpDto) {
        const sessionStr = await this.redisService.get(`${REDIS_KEYS.CLIENT_REGISTER_OTP}:${dto.phone}`);
        if (!sessionStr) {
            throw new BadRequestException('Invalid or expired OTP. Please restart registration.');
        }

        const sessionData = JSON.parse(sessionStr);

        if (sessionData.otp !== dto.otp) {
            throw new BadRequestException('Invalid OTP.');
        }

        // OTP valid, create user
        let user = await this.clientService.findByPhone(dto.phone);
        if (!user) {
            user = await this.clientService.create({ name: sessionData.name, phone: dto.phone } as any);
        }

        await this.redisService.del(`${REDIS_KEYS.CLIENT_REGISTER_OTP}:${dto.phone}`);

        return this.generateAuthResponse(user);
    }

    async signIn(signInDto: ClientSignInDto) {
        const user = await this.clientService.findByPhone(signInDto.phone);

        if (!user) {
            throw new UnprocessableEntityException('Phone number is not registered.');
        }

        if (!user.isActive) {
            throw new UnprocessableEntityException('Your account has been deactivated.');
        }

        const otp = this.generateOtp();
        const ttlMs = parseDurationToMs('10m');

        await this.redisService.set(`${REDIS_KEYS.CLIENT_LOGIN_OTP}:${signInDto.phone}`, otp, ttlMs);

        return { otp };
    }

    async verifyLoginOtp(dto: VerifyOtpDto) {
        const storedOtp = await this.redisService.get(`${REDIS_KEYS.CLIENT_LOGIN_OTP}:${dto.phone}`);

        if (!storedOtp || storedOtp !== dto.otp) {
            throw new BadRequestException('Invalid or expired OTP.');
        }

        const user = await this.clientService.findByPhone(dto.phone);
        if (!user || !user.isActive) {
            throw new NotFoundException('Client not found or deactivated.');
        }

        await this.redisService.del(`${REDIS_KEYS.CLIENT_LOGIN_OTP}:${dto.phone}`);

        return this.generateAuthResponse(user);
    }

    async resendOtp(dto: ResendOtpDto) {
        // Try to see if it's a login flow first
        const user = await this.clientService.findByPhone(dto.phone);
        if (user) {
            return this.signIn({ phone: dto.phone });
        }

        // If not, it's a register flow
        const sessionStr = await this.redisService.get(`${REDIS_KEYS.CLIENT_REGISTER_OTP}:${dto.phone}`);
        if (!sessionStr) {
            throw new BadRequestException('Registration session expired. Please start again.');
        }

        const sessionData = JSON.parse(sessionStr);
        return this.register({ phone: dto.phone, name: sessionData.name });
    }

    async refreshTokens(dto: RefreshTokenDto, headerToken?: string | null) {
        const sessionStr = await this.redisService.get(`${REDIS_KEYS.REFRESH_TOKEN}:${dto.refreshToken}`);

        if (!sessionStr) {
            throw new UnprocessableEntityException('Invalid or expired refresh token. Please sign in again.');
        }

        let userId: number;
        let oldAccessToken: string | null = null;

        try {
            const parsed = JSON.parse(sessionStr);
            if (parsed && typeof parsed === 'object' && parsed.userId) {
                userId = typeof parsed.userId === 'number' ? parsed.userId : parseInt(parsed.userId, 10);
                oldAccessToken = parsed.accessToken || null;
            } else {
                userId = parseInt(sessionStr, 10);
            }
        } catch {
            userId = parseInt(sessionStr, 10);
        }

        const user = await this.clientService.findOne(userId);

        if (!user.isActive) {
            await this.redisService.del(`${REDIS_KEYS.REFRESH_TOKEN}:${dto.refreshToken}`);
            throw new UnprocessableEntityException('Your account has been deactivated. Please sign in again.');
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

        return this.generateAuthResponse(user);
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

    async isUserInvalidated(userId: number, tokenIssuedAtMs: number): Promise<boolean> {
        const invalidatedAt = await this.redisService.get(`${REDIS_KEYS.CLIENT_INVALIDATED}:${userId}`);
        if (!invalidatedAt) return false;
        return parseInt(invalidatedAt, 10) > tokenIssuedAtMs;
    }

    async getProfile(userId: number) {
        return this.clientService.findOne(userId);
    }
}
