import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Address, BaseService, PaginatedResult } from '@libs/index';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService extends BaseService<Address> {
  constructor(
    @InjectRepository(Address)
    repository: Repository<Address>,
  ) {
    super(repository);
  }

  override async findAll(options?: any): Promise<PaginatedResult<Address>> {
    const where: any = { ...(options?.where || {}) };
    const clientId = options?.clientId || options?.filters?.clientId;
    if (clientId) where.clientId = clientId;
    const govId = options?.governorateId || options?.filters?.governorateId;
    if (govId) where.governorateId = govId;

    // Ensure active addresses unless withDeleted is explicitly requested,
    // while withDeleted: true enables joined relations (e.g. client) to be populated even if trashed
    const withDeleted = options?.withDeleted ?? false;
    if (!withDeleted) {
      where.deletedAt = IsNull();
    }

    return super.findAll({
      ...options,
      where,
      withDeleted: true,
      relations: options?.relations ?? ['client', 'governorate', 'area'],
      searchableFields: [
        'label',
        'street',
        'block',
        'houseNumber',
        'additionalDetails',
      ],
    });
  }

  override async findOne(
    id: number | string,
    withDeleted = false,
    relations?: any,
    select?: any,
  ): Promise<Address> {
    const entity = await super.findOne(
      id,
      true, // withDeleted: true ensures related entities (client) are populated even if soft-deleted
      relations ?? ['client', 'governorate', 'area'],
      select,
    );

    if (!withDeleted && entity.deletedAt) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    return entity;
  }

  async findByClientId(clientId: number): Promise<Address[]> {
    return this.repository.find({
      where: { clientId, deletedAt: IsNull() },
      relations: ['client', 'governorate', 'area'],
      withDeleted: true,
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async createAddress(dto: CreateAddressDto): Promise<Address> {
    const count = await this.repository.count({ where: { clientId: dto.clientId } });
    const isDefault = count === 0 ? true : !!dto.isDefault;

    if (isDefault) {
      await this.repository.update(
        { clientId: dto.clientId, isDefault: true },
        { isDefault: false },
      );
    }

    return super.create({
      ...dto,
      isDefault,
    });
  }

  async updateAddress(id: number, dto: UpdateAddressDto): Promise<Address> {
    const existing = await this.findOne(id);
    const clientId = dto.clientId ?? existing.clientId;

    if (dto.isDefault) {
      await this.repository.update(
        { clientId, isDefault: true },
        { isDefault: false },
      );
    }

    await this.repository.update(id, dto);
    return this.findOne(id);
  }
}
