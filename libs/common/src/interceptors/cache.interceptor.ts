import { RedisService } from "@libs/redis/src/redis.service"
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import Redis from "ioredis";
import { Observable, of, tap } from "rxjs";
import { CACHE_OPTIONS_KEY, CacheOptions } from "../decorators/cacheable.decorator";

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    constructor(
        private readonly redisService: RedisService,
        private readonly reflector: Reflector
    ) { }
    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        // 1. Get the cashing ttl from the decorator metadata
        const cacheOptions = this.reflector.get<CacheOptions>(CACHE_OPTIONS_KEY,
            context.getHandler(),
        );

        if (!cacheOptions || !cacheOptions.ttlInSeconds)
            return next.handle();

        const { ttlInSeconds, key } = cacheOptions;

        const cachingKey = key ?? context.switchToHttp().getRequest().path;

        // 2. Check redis for data existence
        const cachedDataStr = await this.redisService.get(cachingKey)

        if (cachedDataStr) {
            return of(JSON.parse(cachedDataStr));
        }

        // 3. CACHE MISS: Execute the controller route
        return next.handle().pipe(
            // The `tap` operator lets us "get" the data as it flows back to the client
            tap(async (response) => {
                // Asynchronously save the fresh data to Redis (don't block the client waiting for Redis)
                await this.redisService.set(cachingKey, JSON.stringify(response), ttlInSeconds * 1000);
            }),
        );
    }

}