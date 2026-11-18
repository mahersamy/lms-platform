import { Module } from '@nestjs/common';
import { ConfigModule } from '@lms/infra-config';
import { DatabaseModule } from '@lms/infra-database';
import { HttpModule } from '@lms/infra-http';
import { RedisModule } from '@lms/infra-redis';
import { RedisCacheModule } from '@lms/infra-redis-cache';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    HttpModule,
    RedisModule,
    RedisCacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
