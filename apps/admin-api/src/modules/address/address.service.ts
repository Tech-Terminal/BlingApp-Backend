import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    return super.findAll({
      ...options,
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
    return super.findOne(
      id,
      withDeleted,
      relations ?? ['client', 'governorate', 'area'],
      select,
    );
  }

  async findByClientId(clientId: number): Promise<Address[]> {
    return this.repository.find({
      where: { clientId },
      relations: ['governorate', 'area'],
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
