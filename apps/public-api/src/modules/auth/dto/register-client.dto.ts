import {
  IsEnum,
  IsString,
  MinLength,
} from 'class-validator';
import { IsUnique } from '@libs/index';

export class RegisterClientDto {
  @IsString({ message: 'يجب أن يكون الاسم نصاً' })
  @MinLength(2, { message: 'يجب ألا يقل الاسم عن حرفين' })
  name!: string;

  @IsString({ message: 'يجب أن يكون رقم الهاتف نصاً' })
  @MinLength(8, { message: 'يجب ألا يقل رقم الهاتف عن 8 أرقام' })
  @IsUnique({ tableName: 'clients', column: 'phone' }, { message: 'رقم الهاتف مسجل مسبقاً' })
  phone!: string;
}
