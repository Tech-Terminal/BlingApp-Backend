import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { DatabaseModule, ValidatorsModule, RedisModule, MailModule, SearchEngineModule } from '@libs/index';
import { AdminModule } from './modules/admin/admin.module';
import { RoleModule } from './modules/role/role.module';
import { AuthModule } from './modules/auth/auth.module';
import { SettingsModule } from './modules/settings/settings.module';
import { StorageModule } from './modules/storage/storage.module';
import { LocationModule } from './modules/location/location.module';
import { ClientModule } from './modules/client/client.module';
import { AddressModule } from './modules/address/address.module';
import { MaidModule } from './modules/maid/maid.module';
import { PickupPointModule } from './modules/pickup-point/pickup-point.module';
import { AuthMiddleware } from './modules/auth/auth.middleware';
import { PermissionsGuard } from './modules/auth/guards/permissions.guard';
import { PUBLIC_ROUTES } from './constants/public-routes.constant';
import { CacheInterceptor } from '@libs/common/src/interceptors/cache.interceptor';
import { ResponseInterceptor } from '@libs/common/src/interceptors/response.interceptor';
import { StatisticsModule } from './modules/statistics/statistics.module';

@Module({
  imports: [
    DatabaseModule,
    ValidatorsModule,
    RedisModule,
    EventEmitterModule.forRoot(),
    MailModule,
    StatisticsModule,
    AdminModule,
    RoleModule,
    SettingsModule,
    AuthModule,
    StorageModule,
    SearchEngineModule,
    LocationModule,
    ClientModule,
    AddressModule,
    MaidModule,
    PickupPointModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AdminAppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude(...PUBLIC_ROUTES).forRoutes('*');
  }
}

