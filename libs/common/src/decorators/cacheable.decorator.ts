import { SetMetadata } from "@nestjs/common";

export const CACHE_OPTIONS_KEY = 'cache_options'

export interface CacheOptions {
    ttlInSeconds: number,
    key?: string
}

export const Cacheable = (cachingOptions: CacheOptions) => {
    return SetMetadata<string, CacheOptions>(CACHE_OPTIONS_KEY, cachingOptions);
}