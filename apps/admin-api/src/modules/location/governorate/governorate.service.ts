import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Governorate } from '@libs/database/src/entities/governorate.entity';
import { BaseService, PaginatedResult } from '@libs/index';

@Injectable()
export class GovernorateService extends BaseService<Governorate> {
  constructor(
    @InjectRepository(Governorate)
    repository: Repository<Governorate>,
  ) {
    super(repository);
  }

  override async findAll(options?: any): Promise<PaginatedResult<Governorate>> {
    const result = await super.findAll({
      ...options,
      relations: ['areas'],
      searchableFields: ['nameAr', 'nameEn'],
    });

    result.data.forEach((gov: any) => {
      gov.areasCount = gov.areas ? gov.areas.length : 0;
    });

    return result;
  }

  override async findOne(
    id: number | string,
    withDeleted = false,
    relations?: any,
    select?: any,
  ): Promise<Governorate> {
    return super.findOne(id, withDeleted, relations ?? ['areas'], select);
  }
}
