import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAddressDto {
  @IsNotEmpty()
  @IsString()
  label!: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  lat!: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  long!: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  governorateId!: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  areaId!: number;

  @IsNotEmpty()
  @IsString()
  street!: string;

  @IsNotEmpty()
  @IsString()
  block!: string;

  @IsNotEmpty()
  @IsString()
  houseNumber!: string;

  @IsOptional()
  @IsString()
  additionalDetails?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
