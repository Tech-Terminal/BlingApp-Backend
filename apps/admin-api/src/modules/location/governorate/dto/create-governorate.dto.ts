import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGovernorateDto {
  @IsNotEmpty()
  @IsString()
  nameEn!: string;

  @IsNotEmpty()
  @IsString()
  nameAr!: string;
}
