import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('governorates')
  getGovernorates() {
    return this.locationService.getGovernorates();
  }

  @Get('areas')
  getAreas(
    @Query('governorateId', new ParseIntPipe({ optional: true }))
    governorateId?: number,
  ) {
    return this.locationService.getAreas(governorateId);
  }
}
