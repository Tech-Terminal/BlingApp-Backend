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

  async createAddress(clientId: number, dto: CreateAddressDto): Promise<Address> {
    const count = await this.repository.count({ where: { clientId } });
    const isDefault = count === 0 ? true : !!dto.isDefault;

    if (isDefault) {
      await this.repository.update({ clientId, isDefault: true }, { isDefault: false });
    }

    return super.create({
      ...dto,
      clientId,
      isDefault,
    });
  }

  async findAllClientAddresses(clientId: number, options?: any): Promise<PaginatedResult<Address>> {
    return super.findAll({
      ...options,
      where: { clientId },
      relations: ['governorate', 'area'],
      searchableFields: ['label', 'street', 'block'],
    });
  }

  async findClientAddress(id: number, clientId: number): Promise<Address> {
    const address = await super.findOne(id, false, ['governorate', 'area']);
    if (address.clientId !== clientId) {
      throw new NotFoundException(`Address #${id} not found`);
    }
    return address;
  }

  async updateAddress(id: number, clientId: number, dto: UpdateAddressDto): Promise<Address> {
    await this.findClientAddress(id, clientId);

    if (dto.isDefault) {
      await this.repository.update({ clientId, isDefault: true }, { isDefault: false });
    }

    await this.repository.update(id, dto);
    return this.findClientAddress(id, clientId);
  }

  async removeAddress(id: number, clientId: number) {
    const address = await this.findClientAddress(id, clientId);
    await super.remove(id);

    // If default address was deleted, set another address as default if exists
    if (address.isDefault) {
      const anotherAddress = await this.repository.findOne({
        where: { clientId },
        order: { createdAt: 'DESC' },
      });
      if (anotherAddress) {
        await this.repository.update(anotherAddress.id, { isDefault: true });
      }
    }

    return { success: true };
  }

  async setDefault(id: number, clientId: number): Promise<Address> {
    await this.findClientAddress(id, clientId);

    await this.repository.update({ clientId, isDefault: true }, { isDefault: false });
    await this.repository.update(id, { isDefault: true });

    return this.findClientAddress(id, clientId);
  }
}
