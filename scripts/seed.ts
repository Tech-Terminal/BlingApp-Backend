import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@libs/database/src/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RedisModule, RedisService, SearchEngineModule } from '@libs/index';
import * as dotenv from 'dotenv';
import { seedRoles } from '@libs/database/src/seeders/role.seeder';
import { seedAdmin } from '@libs/database/src/seeders/admin.seeder';
import { seedSettings } from '@libs/database/src/seeders/setting.seeder';
import { seedLocations } from '@libs/database/src/seeders/location.seeder';

dotenv.config();


import { AdminAppModule } from '../apps/admin-api/src/admin-app.module';
import { PublicApiModule } from '../apps/public-api/src/public-api.module';

@Module({
  imports: [
    AdminAppModule,
    PublicApiModule,
  ],
})
class SeedModule { }

async function bootstrap() {
  console.log('🌱 Starting Database Seeder...');

  // Bootstrap the application context headlessly
  const app = await NestFactory.createApplicationContext(SeedModule);

  // Get the database and redis connections
  const dataSource = app.get(DataSource);
  
  console.log('Registered Entities:', dataSource.entityMetadatas.map(e => e.name));

  const redisService = app.get(RedisService);

  const shouldFresh = process.argv.includes('--fresh-db');
  const shouldSync = process.argv.includes('--sync-schema');
  const shouldFlush = process.argv.includes('--flush-redis');

  if (shouldFresh) {
    console.log('🧹 Synchronizing database (dropping schema)...');
    await dataSource.synchronize(true);
    console.log('✅ Schema synchronized (dropped and recreated) successfully.');
  } else if (shouldSync) {
    console.log('🔄 Synchronizing database (keeping existing data)...');
    await dataSource.synchronize(false);
    console.log('✅ Schema synchronized successfully.');
  }

  if (shouldFlush) {
    console.log('🗑️  Flushing Redis...');
    await redisService.flushall();
    console.log('✅ Redis flushed successfully.');
  }

  // Execute Seeders Sequentially
  const superAdminRole = await seedRoles(dataSource);
  await seedAdmin(dataSource, superAdminRole);
  await seedSettings(dataSource);
  await seedLocations(dataSource);


  console.log('🎉 Seeding completed successfully!');
  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('❌ Seeding failed!', err);
  process.exit(1);
});
