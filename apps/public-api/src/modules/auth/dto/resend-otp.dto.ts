import { IsString, MinLength } from 'class-validator';

export class ResendOtpDto {
  @IsString({ message: 'يجب أن يكون رقم الهاتف نصاً' })
  @MinLength(8, { message: 'يجب ألا يقل رقم الهاتف عن 8 أرقام' })
  phone!: string;
}
