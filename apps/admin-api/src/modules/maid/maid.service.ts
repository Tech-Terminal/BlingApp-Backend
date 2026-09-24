import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maid, BaseService } from '@libs/index';
import { CreateMaidDto } from './dto/create-maid.dto';
import { UpdateMaidDto } from './dto/update-maid.dto';

@Injectable()
export class MaidService extends BaseService<Maid> {
  constructor(
    @InjectRepository(Maid)
    repository: Repository<Maid>,
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
  ): Promise<Maid> {
    return super.findOne(
      id,
      withDeleted,
      relations,
      select,
    );
  }
}
