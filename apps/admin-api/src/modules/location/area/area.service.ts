import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Area } from '@libs/database/src/entities/area.entity';
import { BaseService, PaginatedResult } from '@libs/index';

@Injectable()
export class AreaService extends BaseService<Area> {
  constructor(
    @InjectRepository(Area)
    repository: Repository<Area>,
  ) {
    super(repository);
  }

  override async findAll(options?: any): Promise<PaginatedResult<Area>> {
    const where: any = {};
    const govId = options?.governorateId || options?.filters?.governorateId;
    if (govId) {
      where.governorateId = govId;
    }

    return super.findAll({
      ...options,
      where,
      relations: ['governorate'],
      searchableFields: ['nameAr', 'nameEn'],
    });
  }

  override async findOne(
    id: number | string,
    withDeleted = false,
    relations?: any,
    select?: any,
  ): Promise<Area> {
    return super.findOne(id, withDeleted, relations ?? ['governorate'], select);
  }

  async countByGovernorate(governorateId: number): Promise<number> {
    return this.repository.count({ where: { governorateId } });
  }

  async findByIds(ids: number[]): Promise<Area[]> {
    if (!ids || ids.length === 0) return [];
    return this.repository.findBy({ id: In(ids) });
  }
}
