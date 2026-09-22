import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Governorate, Area } from '@libs/index';
import { GovernorateService } from './governorate/governorate.service';
import { GovernorateController } from './governorate/governorate.controller';
import { AreaService } from './area/area.service';
import { AreaController } from './area/area.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Governorate, Area])],
  controllers: [GovernorateController, AreaController],
  providers: [GovernorateService, AreaService],
  exports: [GovernorateService, AreaService],
})
export class LocationModule {}
