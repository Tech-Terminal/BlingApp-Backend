import { Repository, DeepPartial, FindOptionsWhere, FindOneOptions } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PaginationDto, PaginatedResult } from '../dto/pagination.dto';

export interface FindAllOptions {
  relations?: any;
  select?: any;
  where?: any;
  pagination?: PaginationDto;
  searchableFields?: string[];
}

export abstract class BaseService<T extends { id: number | string }> {
  constructor(protected readonly repository: Repository<T>) { }

  async create(createDto: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(createDto);
    return this.repository.save(entity);
  }

  async findAll(options?: FindAllOptions): Promise<PaginatedResult<T>> {
    const { relations, select, pagination, where = {} } = options || {};

    const findOptions: any = { where };
    if (relations) findOptions.relations = relations;
    if (select) findOptions.select = select;
    if (options?.searchableFields) findOptions.searchableFields = options.searchableFields;

    return this.repository.paginate(pagination, findOptions);
  }

  async findOne(id: number | string, withDeleted = false, relations?: any, select?: any): Promise<T> {
    const where: any = { id };

    const findOptions: any = { where, withDeleted };
    if (relations) findOptions.relations = relations;
    if (select) findOptions.select = select;

    const entity = await this.repository.findOne(findOptions as FindOneOptions<T>);

    if (!entity) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    return entity;
  }

  async update(id: number | string, updateDto: any): Promise<T> {
    const entity = await this.findOne(id);

    // Check if soft deleted
    if ((entity as any).deletedAt) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    await this.repository.update(id as any, updateDto);
    return this.findOne(id);
  }

  async remove(id: number | string): Promise<T> {
    const entity = await this.findOne(id);
    await this.repository.softDelete(id as any);
    return entity;
  }

  async removeHard(id: number | string): Promise<{ success: boolean }> {
    await this.findOne(id, true);
    await this.repository.delete(id as any);
    return { success: true };
  }

  async restore(id: number | string): Promise<T> {
    await this.findOne(id, true);
    await this.repository.restore(id as any);
    return this.findOne(id);
  }
}
