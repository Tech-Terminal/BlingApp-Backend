import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminDto } from './create-admin.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
    @IsNumber()
    @IsOptional()
    id?: number;
}
