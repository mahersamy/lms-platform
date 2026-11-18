import { Inject, Injectable } from "@nestjs/common";

import { CacheStore } from "@lms-platform/cache";
import { REDIS_CLIENT } from "@lms/infra-redis";

import Redis from "ioredis";

@Injectable()
export class RedisCacheAdapter implements CacheStore {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);

    if (value === null) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  async set<T>(
    key: string,
    value: T,
    ttl?: number,
  ): Promise<void> {
    const serialized = JSON.stringify(value);

    if (ttl) {
      await this.redis.set(key, serialized, 'EX', ttl);
      return;
    }

    await this.redis.set(key, serialized);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}