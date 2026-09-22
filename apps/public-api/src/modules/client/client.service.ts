import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Client, RedisService, parseDurationToMs, hashPassword, REDIS_KEYS } from '@libs/index';
import { AppConfig } from '@libs/config/app.config';
import { RegisterClientDto } from '../auth/dto/register-client.dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
    private readonly redisService: RedisService
  ) {}

  async create(registerDto: DeepPartial<Client>): Promise<Client> {
    const user = this.clientRepo.create({
      ...registerDto,
      isActive: true,
    });
    return await this.clientRepo.save(user);
  }

  async findByEmail(email: string) {
    return this.clientRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findByPhone(phone: string): Promise<Client | null> {
    return this.clientRepo.findOne({ where: { phone } });
  }

  async findOne(id: number) {
    const user = await this.clientRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Client not found.');
    }
    return user;
  }

  async update(id: number, updateDto: any) {
    const user = await this.findOne(id);
    Object.assign(user, updateDto);
    return await this.clientRepo.save(user);
  }

  async invalidateClient(id: number) {
    const ttlMs = parseDurationToMs(AppConfig.JWT_EXPIRES_IN as string);
    await this.redisService.set(`${REDIS_KEYS.CLIENT_INVALIDATED}:${id}`, Date.now().toString(), ttlMs);
  }
}
