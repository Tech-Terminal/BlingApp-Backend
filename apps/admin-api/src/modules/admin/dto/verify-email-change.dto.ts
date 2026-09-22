import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyEmailChangeDto {
    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    otp!: string;
}
