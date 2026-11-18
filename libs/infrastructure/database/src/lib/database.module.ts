import { Global, Inject, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { Pool } from 'pg';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE, PG_CLIENT } from './database.constants';
import { TransactionManager } from './transaction-manager';
import { drizzleProvider, pgClientProvider } from './database.provider';

export type DrizzleDb = NodePgDatabase;

@Global()
@Module({
  providers: [TransactionManager, pgClientProvider, drizzleProvider],
  exports: [DRIZZLE, PG_CLIENT, TransactionManager],
})
export class DatabaseModule implements OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(@Inject(PG_CLIENT) private readonly pool: Pool) {}

  async onApplicationShutdown() {
    await this.pool.end();
    this.logger.log('Database connection closed');
  }
}
