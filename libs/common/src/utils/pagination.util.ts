import { Repository, FindManyOptions, ObjectLiteral, ILike, In } from 'typeorm';
import { PaginationDto, PaginatedResult } from '../dto/pagination.dto';

export interface PaginateOptions<Entity> extends FindManyOptions<Entity> {
  searchableFields?: string[];
}

declare module 'typeorm' {
  interface Repository<Entity extends ObjectLiteral> {
    paginate(
      pagination?: PaginationDto,
      options?: PaginateOptions<Entity>,
    ): Promise<PaginatedResult<Entity>>;
  }
}

/**
 * Extracts normalized page, limit, and offset from PaginationDto
 */
export function getPaginationParams(dto?: { page?: number; limit?: number }) {
  const page = dto?.page || 1;
  const limit = dto?.limit || 10;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Formats a search engine (Meilisearch) result into the standard system PaginatedResult structure
 */
export function formatSearchPagination<T>(
  searchResult: { hits: T[]; estimatedTotalHits?: number },
  page: number = 1,
  limit: number = 10,
): PaginatedResult<T> {
  const totalItems = searchResult.estimatedTotalHits ?? searchResult.hits.length;
  return {
    data: searchResult.hits,
    meta: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit) || 1,
    },
  };
}

Repository.prototype.paginate = async function <Entity extends ObjectLiteral>(
  this: Repository<Entity>,
  pagination?: PaginationDto,
  options: PaginateOptions<Entity> = {},
): Promise<PaginatedResult<Entity>> {
  const { page, limit, offset: skip } = getPaginationParams(pagination);

  const { searchableFields, ...typeormOptions } = options;
  let where: any = typeormOptions.where || {};

  // 1. Apply Filters
  if (pagination?.filters) {
    const filtersObj = pagination.filters;

    const filterConditions: any = {};
    for (const [key, value] of Object.entries(filtersObj)) {
      if (value === null || value === undefined || value === '') {
        continue;
      }
      
      if (Array.isArray(value)) {
        filterConditions[key] = In(value);
      } else if (typeof value === 'object') {
        filterConditions[key] = value; // Support nested like { role: { id: 1 } }
      } else {
        filterConditions[key] = value;
      }
    }

    if (Array.isArray(where)) {
      where = where.map((w) => ({ ...w, ...filterConditions }));
    } else {
      where = { ...where, ...filterConditions };
    }
  }

  // 2. Apply Search
  if (pagination?.search && searchableFields && searchableFields.length > 0) {
    const searchConditions = searchableFields.map((field) => {
      return { [field]: ILike(`%${pagination.search}%`) };
    });

    if (Array.isArray(where) || Object.keys(where).length > 0) {
      const baseWhere = Array.isArray(where) ? where : [where];
      const newWhere: any[] = [];
      for (const bw of baseWhere) {
        for (const sc of searchConditions) {
          newWhere.push({ ...bw, ...sc });
        }
      }
      where = newWhere;
    } else {
      where = searchConditions;
    }
  }

  typeormOptions.where = where;

  // Default ordering: DESC by id across the entire app
  if (!typeormOptions.order || Object.keys(typeormOptions.order).length === 0) {
    typeormOptions.order = { id: 'DESC' } as any;
  }

  const [data, count] = await this.findAndCount({
    ...typeormOptions,
    skip,
    take: limit,
  });

  return {
    data,
    meta: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit) || 1,
    },
  };
};
