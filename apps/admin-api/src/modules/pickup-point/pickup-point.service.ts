import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PickupPoint, BaseService, PaginatedResult } from '@libs/index';
import { MaidService } from '../maid/maid.service';
import { CreatePickupPointDto } from './dto/create-pickup-point.dto';
import { UpdatePickupPointDto } from './dto/update-pickup-point.dto';

@Injectable()
export class PickupPointService extends BaseService<PickupPoint> {
  constructor(
    @InjectRepository(PickupPoint)
    repository: Repository<PickupPoint>,
    private readonly maidService: MaidService,
  ) {
    super(repository);
  }

  override async findAll(options?: any): Promise<PaginatedResult<PickupPoint>> {
    const where: any = { ...(options?.where || {}) };
    const withDeleted = options?.withDeleted ?? false;
    if (!withDeleted) {
      where.deletedAt = IsNull();
    }

    return super.findAll({
      ...options,
      where,
      withDeleted: true,
      relations: options?.relations ?? ['maids'],
      searchableFields: ['label', 'streetName', 'buildingNumber'],
    });
  }

  override async findOne(
    id: number | string,
    withDeleted = false,
    relations: any = ['maids'],
    select?: any,
  ): Promise<PickupPoint> {
    return super.findOne(id, withDeleted, relations, select);
  }

  override async create(createDto: CreatePickupPointDto): Promise<PickupPoint> {
    const { maidIds, ...data } = createDto;
    const item = await super.create(data as any);

    if (maidIds && maidIds.length > 0) {
      await this.maidService.attachToPickupPoint(maidIds, item.id);
    }

    return this.findOne(item.id);
  }

  override async update(
    id: number,
    updateDto: UpdatePickupPointDto,
  ): Promise<PickupPoint> {
    const { maidIds, ...data } = updateDto;
    await super.update(id, data as any);

    if (maidIds !== undefined) {
      // Detach all maids previously assigned to this point
      await this.maidService.detachFromPickupPoint(id);

      // Attach new selected maids
      if (maidIds.length > 0) {
        await this.maidService.attachToPickupPoint(maidIds, id);
      }
    }

    return this.findOne(id);
  }
}
