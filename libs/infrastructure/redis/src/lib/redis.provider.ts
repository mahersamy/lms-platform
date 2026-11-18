import type { Provider } from '@nestjs/common';
import type { AppConfig } from '@lms/infra-config';

import Redis from 'ioredis';
import { Logger } from '@nestjs/common';
import { APP_CONFIG } from '@lms/infra-config';
import { REDIS_CLIENT } from './redis.constants';

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [APP_CONFIG],
  useFactory: (config: AppConfig) => {
    const logger = new Logger('RedisModule');

    const client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      lazyConnect: false,
      maxRetriesPerRequest: 3,
    });

    client.on('error', (err) => {
      logger.error(`Redis connection error: ${err.message}`, err.stack);
    });

    client.on('connect', () => {
      logger.log('Connected to Redis');
    });

    return client;
  },
};
