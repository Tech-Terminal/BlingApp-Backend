import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageModule as LibStorageModule } from '@libs/index';

@Module({
    imports: [LibStorageModule],
    controllers: [StorageController],
})
export class StorageModule {}
