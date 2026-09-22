import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Client,
  Address,
  BaseService,
  RedisService,
  REDIS_KEYS,
  parseDurationToMs,
} from '@libs/index';
import { AppConfig } from '@libs/config/app.config';
import { AddressService } from '../address/address.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientService extends BaseService<Client> {
  constructor(
    @InjectRepository(Client)
    repository: Repository<Client>,
    private readonly addressService: AddressService,
    private readonly redisService: RedisService,
  ) {
    super(repository);
  }

  override async findAll(options?: any) {
    return super.findAll({
      ...options,
      relations: options?.relations ?? [],
      searchableFields: ['name', 'email', 'phone'],
    });
  }

  override async findOne(
    id: number | string,
    withDeleted = false,
    relations?: any,
    select?: any,
  ): Promise<Client> {
    return super.findOne(
      id,
      withDeleted,
      relations ?? ['addresses', 'addresses.governorate', 'addresses.area'],
      select,
    );
  }

  async findClientAddresses(clientId: number): Promise<Address[]> {
    await this.findOne(clientId);
    return this.addressService.findByClientId(clientId);
  }

  private async invalidateClient(id: number | string) {
    const ttlMs = parseDurationToMs(AppConfig.JWT_EXPIRES_IN as string);
    await this.redisService.set(
      `${REDIS_KEYS.CLIENT_INVALIDATED}:${id}`,
      Date.now().toString(),
      ttlMs,
    );
  }

  override async update(id: number | string, updateDto: UpdateClientDto): Promise<Client> {
    const result = await super.update(id, updateDto);

    if (updateDto.isActive === false) {
      await this.invalidateClient(id);
    }

    return result;
  }

  override async remove(id: number | string): Promise<Client> {
    const result = await super.remove(id);
    await this.invalidateClient(id);
    return result;
  }

  override async removeHard(id: number | string): Promise<{ success: boolean }> {
    const result = await super.removeHard(id);
    await this.invalidateClient(id);
    return result;
  }

  override async restore(id: number | string): Promise<Client> {
    return super.restore(id);
  }
}
