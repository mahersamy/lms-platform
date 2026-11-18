import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DRIZZLE, PG_CLIENT } from './database.constants';
import { APP_CONFIG, AppConfig } from '@lms/infra-config';
import { Logger, Provider } from '@nestjs/common';

export const pgClientProvider: Provider = {
  provide: PG_CLIENT,
  inject: [APP_CONFIG],
  useFactory: (config: AppConfig) => {
    return new Pool({ connectionString: config.database.url });
  },
};

export const drizzleProvider: Provider = {
  provide: DRIZZLE,
  inject: [PG_CLIENT],
  useFactory: (pool: Pool) => {
    const logger = new Logger('DatabaseModule');
    const db = drizzle({ client: pool });
    logger.log('Database connected');
    return db;
  },
};