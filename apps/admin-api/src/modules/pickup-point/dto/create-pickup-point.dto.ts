import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePickupPointDto {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  @IsOptional()
  streetName?: string;

  @IsString()
  @IsOptional()
  buildingNumber?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lat?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  long?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  distance?: number; // Distance in Km (radius)

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  maidIds?: number[];
}
