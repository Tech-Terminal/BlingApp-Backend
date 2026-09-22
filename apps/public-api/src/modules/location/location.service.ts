import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Governorate, Area } from '@libs/index';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Governorate)
    private readonly governorateRepository: Repository<Governorate>,
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
  ) {}

  async getGovernorates(): Promise<Governorate[]> {
    return this.governorateRepository.find({
      order: { id: 'ASC' },
    });
  }

  async getAreas(governorateId?: number): Promise<Area[]> {
    const where: any = {};
    if (governorateId) {
      where.governorateId = governorateId;
    }

    return this.areaRepository.find({
      where,
      order: { nameEn: 'ASC' },
    });
  }
}
