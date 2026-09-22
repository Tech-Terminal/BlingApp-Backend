import { Controller, Get, Patch, Body, UseInterceptors } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { RESOURCES, ACTIONS, SETTINGS_CACHING_KEY } from '@libs/index';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Cacheable } from '@libs/common/src/decorators/cacheable.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

  @Get()
  @Permissions(RESOURCES.SETTING, ACTIONS.LIST_VIEW)
  @Cacheable({ttlInSeconds: 60*60*24, key: SETTINGS_CACHING_KEY})
  findAll() {
    return this.settingsService.findAll();
  }

  @Patch()
  @Permissions(RESOURCES.SETTING, ACTIONS.UPDATE)
  bulkUpdate(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.bulkUpdate(updateSettingsDto);
  }
}
