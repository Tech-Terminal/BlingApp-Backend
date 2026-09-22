import { IsNotEmpty, IsString, MinLength, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty()
    oldPassword!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(12, { message: 'Password must be at least 12 characters long' })
    @IsStrongPassword({}, { message: 'Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol' })
    newPassword!: string;
}
