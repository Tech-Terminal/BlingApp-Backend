import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PickupPoint, BaseService, PaginatedResult, Area } from '@libs/index';
import { MaidService } from '../maid/maid.service';
import { AreaService } from '../location/area/area.service';
import { CreatePickupPointDto } from './dto/create-pickup-point.dto';
import { UpdatePickupPointDto } from './dto/update-pickup-point.dto';

@Injectable()
export class PickupPointService extends BaseService<PickupPoint> {
  constructor(
    @InjectRepository(PickupPoint)
    repository: Repository<PickupPoint>,
    private readonly maidService: MaidService,
    private readonly areaService: AreaService,
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
      relations: options?.relations ?? ['maids', 'areas', 'areas.governorate'],
      searchableFields: ['label', 'streetName', 'buildingNumber'],
    });
  }

  override async findOne(
    id: number | string,
    withDeleted = false,
    relations: any = ['maids', 'areas', 'areas.governorate'],
    select?: any,
  ): Promise<PickupPoint> {
    return super.findOne(id, withDeleted, relations, select);
  }

  override async create(createDto: CreatePickupPointDto): Promise<PickupPoint> {
    const { maidIds, areaIds, ...data } = createDto;

    let areas: Area[] = [];
    if (areaIds && areaIds.length > 0) {
      areas = await this.areaService.findByIds(areaIds);
    }

    const item = await super.create({
      ...data,
      areas,
    } as any);

    if (maidIds && maidIds.length > 0) {
      await this.maidService.attachToPickupPoint(maidIds, item.id);
    }

    return this.findOne(item.id);
  }

  override async update(
    id: number,
    updateDto: UpdatePickupPointDto,
  ): Promise<PickupPoint> {
    const { maidIds, areaIds, ...data } = updateDto;

    const point = await this.findOne(id);

    if (areaIds !== undefined) {
      let areas: Area[] = [];
      if (areaIds.length > 0) {
        areas = await this.areaService.findByIds(areaIds);
      }
      point.areas = areas;
    }

    Object.assign(point, data);
    await this.repository.save(point);

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
