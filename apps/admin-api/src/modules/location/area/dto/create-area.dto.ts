import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAreaDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  governorateId!: number;

  @IsNotEmpty()
  @IsString()
  nameEn!: string;

  @IsNotEmpty()
  @IsString()
  nameAr!: string;
}
