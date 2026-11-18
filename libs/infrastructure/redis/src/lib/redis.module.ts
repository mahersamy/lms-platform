import {
  Global,
  Inject,
  Logger,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigModule } from '@lms/infra-config';

import { redisProvider } from './redis.provider';
import { REDIS_CLIENT } from './redis.constants';


@Global()
@Module({
  imports: [ConfigModule],
  providers: [redisProvider],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisModule.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onApplicationShutdown() {
    try {
      await this.redis.quit();
      this.logger.log('Redis connection closed');
    } catch {
      this.redis.disconnect();
      this.logger.warn('Redis connection forcefully disconnected');
    }
  }
}
