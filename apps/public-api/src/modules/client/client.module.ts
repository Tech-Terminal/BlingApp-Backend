import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientService } from './client.service';
import { Client } from '@libs/database/src/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  controllers: [],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
