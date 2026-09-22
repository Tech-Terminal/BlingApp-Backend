import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SETTING_KEYS } from '@libs/index';

export class SettingItemDto {
    @IsEnum(SETTING_KEYS)
    key!: SETTING_KEYS;

    @IsString()
    @IsOptional()
    value?: string;
}

export class UpdateSettingsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SettingItemDto)
    settings!: SettingItemDto[];
}
