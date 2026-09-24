import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Governorate } from '@libs/database/src/entities/governorate.entity';
import { BaseService, PaginatedResult } from '@libs/index';
import { AreaService } from '../area/area.service';

@Injectable()
export class GovernorateService extends BaseService<Governorate> {
  constructor(
    @InjectRepository(Governorate)
    repository: Repository<Governorate>,
    private readonly areaService: AreaService,
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

  override async remove(id: number | string) {
    const areasCount = await this.areaService.countByGovernorate(Number(id));
    if (areasCount > 0) {
      throw new BadRequestException(
        'Cannot delete governorate because it has associated areas',
      );
    }
    return super.remove(id);
  }

  override async removeHard(id: number | string) {
    const areasCount = await this.areaService.countByGovernorate(Number(id));
    if (areasCount > 0) {
      throw new BadRequestException(
        'Cannot delete governorate because it has associated areas',
      );
    }
    return super.removeHard(id);
  }
}
