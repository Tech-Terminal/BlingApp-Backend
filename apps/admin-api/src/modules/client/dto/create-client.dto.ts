import { IsNotEmpty, IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { IsUnique } from '@libs/index';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @IsUnique({ tableName: 'clients', column: 'phone' })
  phone!: string;

  @IsEmail()
  @IsOptional()
  @IsUnique({ tableName: 'clients', column: 'email' })
  email?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
