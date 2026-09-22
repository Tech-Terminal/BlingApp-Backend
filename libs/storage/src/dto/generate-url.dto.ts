import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateUrlDto {
    @IsString()
    @IsNotEmpty()
    fileName!: string;

    @IsString()
    @IsNotEmpty()
    contentType!: string;
}
