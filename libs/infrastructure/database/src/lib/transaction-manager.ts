import { AsyncLocalStorage } from 'node:async_hooks';
import { Inject, Injectable } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from './database.constants';

export type Database = NodePgDatabase;

@Injectable()
export class TransactionManager {
  private readonly storage = new AsyncLocalStorage<Database>();

  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  /** The active transaction when inside run(), otherwise the shared pool. */
  get current(): Database {
    return this.storage.getStore() ?? this.db;
  }

  /** Throwing rolls back. Nested calls join the outer transaction. */
  run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.storage.getStore()) return fn();
    return this.db.transaction((tx) =>
      this.storage.run(tx as unknown as Database, fn),
    );
  }
}