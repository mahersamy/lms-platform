import { Global, Module } from '@nestjs/common';
import { CACHE_STORE } from '@lms/shared-cache';
import { RedisCacheAdapter } from './redis-cache.adapter';

@Module({
  providers: [
    RedisCacheAdapter,

    {
      provide: CACHE_STORE,
      useExisting: RedisCacheAdapter,
    },
  ],
  exports: [RedisCacheAdapter, CACHE_STORE],
})
export class RedisCacheModule { }
