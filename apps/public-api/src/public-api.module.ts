import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  DatabaseModule,
  RedisModule,
  ValidatorsModule,
  MailModule,
  ResponseInterceptor,
  EnumTransformInterceptor,
} from '@libs/index';
import { ClientModule } from './modules/client/client.module';
import { AuthModule } from './modules/auth/auth.module';
import { LocationModule } from './modules/location/location.module';
import { AddressModule } from './modules/address/address.module';
import { AuthMiddleware } from './modules/auth/auth.middleware';
import { PUBLIC_ROUTES } from './constants/public-routes.constant';



import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 10000, // 10 seconds (~0.16 mins) - burst protection (max 1 req)
        limit: 1,
      },
      {
        name: 'medium',
        ttl: 60000, // 1 min (max 3 reqs)
        limit: 3,
      },
      {
        name: 'long',
        ttl: 900000, // 15 mins (max 5 reqs)
        limit: 5,
      },
    ]),
    DatabaseModule,
    RedisModule,
    ValidatorsModule,
    MailModule,
    EventEmitterModule.forRoot(),
    ClientModule,
    AuthModule,
    LocationModule,
    AddressModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: EnumTransformInterceptor,
    },
  ],
})
export class PublicApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(...PUBLIC_ROUTES)
      .forRoutes('*');
  }
}
