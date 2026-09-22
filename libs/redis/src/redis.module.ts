import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfig } from '@libs/config/app.config';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: AppConfig.REDIS_HOST,
          port: AppConfig.REDIS_PORT_NUMBER,
          password: AppConfig.REDIS_PASSWORD || undefined,
        });
      },
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
