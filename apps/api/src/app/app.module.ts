import { Module } from '@nestjs/common';
import { ConfigModule } from '@lms/infra-config';
import { DatabaseModule } from '@lms/infra-database';
import { HttpModule } from '@lms/infra-http';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
