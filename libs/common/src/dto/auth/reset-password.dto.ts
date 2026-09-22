import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'يجب كتابة بريد إلكتروني صحيح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email!: string;

  @IsString({ message: 'رمز التحقق يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'رمز التحقق مطلوب' })
  @Length(6, 6, { message: 'رمز التحقق يتكون من 6 أرقام' })
  otp!: string;

  @IsString({ message: 'كلمة المرور الجديدة يجب أن تكون نصاً' })
  @MinLength(8, { message: 'كلمة المرور يجب ألا تقل عن 8 أحرف' })
  @IsNotEmpty({ message: 'كلمة المرور الجديدة مطلوبة' })
  newPassword!: string;
}
