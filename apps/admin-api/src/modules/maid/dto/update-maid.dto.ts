import { PartialType } from '@nestjs/mapped-types';
import { CreateMaidDto } from './create-maid.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateMaidDto extends PartialType(CreateMaidDto) {
  @IsNumber()
  @IsOptional()
  id?: number;
}
