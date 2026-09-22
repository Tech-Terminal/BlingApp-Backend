import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'يجب كتابة بريد إلكتروني صحيح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email!: string;
}
