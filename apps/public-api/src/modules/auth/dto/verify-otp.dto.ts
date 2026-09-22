import { IsString, MinLength } from 'class-validator';

export class VerifyOtpDto {
  @IsString({ message: 'يجب أن يكون رقم الهاتف نصاً' })
  @MinLength(8, { message: 'يجب ألا يقل رقم الهاتف عن 8 أرقام' })
  phone!: string;

  @IsString({ message: 'يجب أن يكون رمز التحقق نصاً' })
  @MinLength(6, { message: 'رمز التحقق يجب أن يكون 6 أرقام' })
  otp!: string;
}
