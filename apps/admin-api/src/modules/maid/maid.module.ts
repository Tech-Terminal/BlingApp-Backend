import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Maid } from '@libs/index';
import { MaidService } from './maid.service';
import { MaidController } from './maid.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Maid])],
  controllers: [MaidController],
  providers: [MaidService],
  exports: [MaidService],
})
export class MaidModule {}
