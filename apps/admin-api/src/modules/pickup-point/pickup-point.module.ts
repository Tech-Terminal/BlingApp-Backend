import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PickupPoint } from '@libs/index';
import { MaidModule } from '../maid/maid.module';
import { PickupPointService } from './pickup-point.service';
import { PickupPointController } from './pickup-point.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PickupPoint]),
    MaidModule,
  ],
  controllers: [PickupPointController],
  providers: [PickupPointService],
  exports: [PickupPointService],
})
export class PickupPointModule {}
