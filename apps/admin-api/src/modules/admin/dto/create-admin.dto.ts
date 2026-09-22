import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { IsUnique, IsExist } from '@libs/index';

export class CreateAdminDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    @IsUnique({ tableName: 'admins', column: 'email' })
    email!: string;

    @IsString()
    @IsOptional()
    @IsUnique({ tableName: 'admins', column: 'phone' })
    phone?: string;

    @IsString()
    @IsOptional()
    image?: string;

    @IsNumber()
    @IsNotEmpty()
    @IsExist({ tableName: 'roles', column: 'id' })
    roleId!: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
