import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { ParseJson } from '../decorators/parse-json.decorator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @ParseJson()
  filters?: Record<string, any>;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}
