import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressDto as BaseCreateAddressDto } from '@libs/index';

export class CreateAddressDto extends BaseCreateAddressDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  clientId!: number;
}
