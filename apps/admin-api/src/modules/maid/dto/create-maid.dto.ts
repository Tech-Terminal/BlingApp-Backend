import { IsNotEmpty, IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { IsUnique } from '@libs/index';

export class CreateMaidDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @IsUnique({ tableName: 'maids', column: 'phone' })
  phone!: string;

  @IsEmail()
  @IsOptional()
  @IsUnique({ tableName: 'maids', column: 'email' })
  email?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  idDocument?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
