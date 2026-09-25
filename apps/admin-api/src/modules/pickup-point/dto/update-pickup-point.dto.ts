import { PartialType } from '@nestjs/mapped-types';
import { CreatePickupPointDto } from './create-pickup-point.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdatePickupPointDto extends PartialType(CreatePickupPointDto) {
  @IsNumber()
  @IsOptional()
  id?: number;
}
