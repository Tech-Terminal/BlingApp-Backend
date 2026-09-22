import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin, RedisService, REDIS_KEYS, parseDurationToMs, comparePassword, hashPassword, EVENTS, BaseService } from '@libs/index';
import { AppConfig } from '@libs/config/app.config';
import { Repository } from 'typeorm';
import { generateAndHashPassword } from './utils/password-generator.util';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AdminService extends BaseService<Admin> {
  constructor(
    @InjectRepository(Admin) private readonly adminRepo: Repository<Admin>,
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(adminRepo);
  }

  async create(createAdminDto: CreateAdminDto) {
    const admin = this.adminRepo.create(createAdminDto)
    
    const { plainTextPassword, hashedPassword } = await generateAndHashPassword(12);

    admin.password = hashedPassword;
    const savedAdmin = await this.adminRepo.save(admin);

    // Emit event to send credentials asynchronously
    this.eventEmitter.emit(EVENTS.MAIL.SEND_ADMIN_CREDENTIALS, {
      email: savedAdmin.email,
      name: savedAdmin.name,
      plainTextPassword
    });

    return { ...savedAdmin, generatedPassword: plainTextPassword };
  }

  async findByEmail(email: string) {
    const admin = await this.adminRepo.findOne({
      where: { email },
      relations: ['role']
    });
    return admin
  }

  async findAll(options?: any) {
    return super.findAll({
      ...options,
      searchableFields: ['name', 'email'],
    });
  }

  private async invalidateAdmin(id: number) {
    const ttlMs = parseDurationToMs(AppConfig.JWT_EXPIRES_IN as string);
    await this.redisService.set(`${REDIS_KEYS.ADMIN_INVALIDATED}:${id}`, Date.now().toString(), ttlMs);
  }

  async update(id: number, updateAdminDto: any) {
    const admin = await this.findOne(id);
    
    // Automatically detect if critical security fields are being changed
    const isRoleChanged = updateAdminDto.roleId !== undefined && updateAdminDto.roleId !== admin.roleId;
    const isEmailChanged = updateAdminDto.email !== undefined && updateAdminDto.email !== admin.email;
    const isPasswordChanged = updateAdminDto.password !== undefined && updateAdminDto.password !== admin.password;
    const isActiveChanged = updateAdminDto.isActive !== undefined && updateAdminDto.isActive !== admin.isActive;
    const shouldInvalidate = isRoleChanged || isEmailChanged || isPasswordChanged || isActiveChanged;

    const result = await super.update(id, updateAdminDto);
    
    if (shouldInvalidate) {
      await this.invalidateAdmin(id);
    }
    
    return result;
  }

  async requestEmailChange(id: number, newEmail: string) {
    // Generate a random 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Redis with a 10-minute TTL
    const payload = JSON.stringify({ newEmail, otp });
    const ttlMs = parseDurationToMs('10m');
    await this.redisService.set(`${REDIS_KEYS.EMAIL_OTP}:${id}`, payload, ttlMs);

    // Emit event to send OTP asynchronously
    this.eventEmitter.emit(EVENTS.MAIL.SEND_EMAIL_CHANGE_OTP, {
      email: newEmail,
      otp
    });

    return;
  }

  async verifyEmailChange(id: number, providedOtp: string) {
    const dataStr = await this.redisService.get(`${REDIS_KEYS.EMAIL_OTP}:${id}`);
    
    if (!dataStr) {
      throw new BadRequestException('Invalid or expired OTP.');
    }

    const data = JSON.parse(dataStr);

    if (data.otp !== providedOtp) {
      throw new BadRequestException('Invalid or expired OTP.');
    }

    // OTP is valid! Update the email.
    await this.adminRepo.update({ id }, { email: data.newEmail });

    // Clean up Redis
    await this.redisService.del(`${REDIS_KEYS.EMAIL_OTP}:${id}`);

    // Invalidate session (since email changed)
    await this.invalidateAdmin(id);

    return;
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const admin = await this.findOne(id);
    
    // Verify old password
    const isMatch = await comparePassword(dto.oldPassword, admin.password);
    if (!isMatch) {
      throw new BadRequestException('Incorrect current password.');
    }

    // Hash new password
    const hashedPassword = await hashPassword(dto.newPassword);

    // Update in DB
    await this.adminRepo.update({ id }, { password: hashedPassword });

    // Invalidate session to force re-login
    await this.invalidateAdmin(id);

    return;
  }

  async remove(id: number) {
    const result = await super.remove(id);
    await this.invalidateAdmin(id);
    return result;
  }

  async removeHard(id: number) {
    const result = await super.removeHard(id);
    await this.invalidateAdmin(id);
    return result;
  }

  async restore(id: number) {
    const result = await super.restore(id);
    await this.invalidateAdmin(id);
    return result;
  }

}
