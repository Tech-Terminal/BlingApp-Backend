import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  /**
   * Sets a value in Redis with an optional expiration time in milliseconds.
   */
  async set(key: string, value: string, ttlMs?: number): Promise<void> {
    if (ttlMs) {
      await this.redisClient.set(key, value, 'PX', ttlMs);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  /**
   * Gets a value from Redis.
   */
  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  /**
   * Deletes a key from Redis.
   */
  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  /**
   * Increments the score of a member in a sorted set by increment.
   */
  async zincrby(key: string, increment: number, member: string): Promise<string> {
    return this.redisClient.zincrby(key, increment, member);
  }

  /**
   * Returns a range of members in a sorted set, by index, ordered from highest to lowest score.
   */
  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redisClient.zrevrange(key, start, stop);
  }

  /**
   * Flushes all data from Redis.
   */
  async flushall(): Promise<void> {
    await this.redisClient.flushall();
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }
}
