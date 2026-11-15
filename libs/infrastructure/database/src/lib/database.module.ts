import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { APP_CONFIG, AppConfig } from '@lms/infra-config';
import { DRIZZLE, PG_CLIENT } from './database.constants';
import { Global, Inject, Logger, Module, OnApplicationShutdown } from '@nestjs/common';

export type DrizzleDb = NodePgDatabase;

@Global()
@Module({
  providers: [
    {
      provide: PG_CLIENT,
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => {
        return new Pool({ connectionString: config.database.url });
      },
    },
    {
      provide: DRIZZLE,
      inject: [PG_CLIENT],
      useFactory: (pool: Pool) => {
        const logger = new Logger(DatabaseModule.name);
        const db = drizzle({ client: pool });
        logger.log('Database connected');
        return db;
      },
    },
  ],
  exports: [DRIZZLE, PG_CLIENT],
})
export class DatabaseModule implements OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(
    @Inject(PG_CLIENT) private readonly pool: Pool
  ) { }

  async onApplicationShutdown() {
    await this.pool.end();
    this.logger.log('Database connection closed');
  }
}
