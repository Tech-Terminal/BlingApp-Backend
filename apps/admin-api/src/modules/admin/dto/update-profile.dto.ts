import { IsOptional, IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { IsUnique } from '@libs/index';

export class UpdateProfileDto {
    @IsNumber()
    @IsOptional()
    id?: number;

    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsString()
    @IsOptional()
    @IsUnique({ tableName: 'admins', column: 'phone' })
    phone?: string;

    @IsString()
    @IsOptional()
    image?: string;
}
