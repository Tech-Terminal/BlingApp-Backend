import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService, Setting, SETTINGS_CACHING_KEY } from '@libs/index';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting) private readonly settingRepo: Repository<Setting>,
    private readonly redisService: RedisService
  ) {}

  async findAll() {
    return this.settingRepo.find();
  }

  async bulkUpdate(updateSettingsDto: UpdateSettingsDto) {
    const { settings } = updateSettingsDto;
    
    if (settings.length > 0) {
      await this.settingRepo.upsert(settings, ['key']);
      await this.redisService.del(SETTINGS_CACHING_KEY)
    }

    return this.findAll();
  }
}
