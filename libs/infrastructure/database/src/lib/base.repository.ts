import { eq } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { Database, TransactionManager } from './transaction-manager';
import { mapDbError } from './errors/database-error.mapper';
import { Repository } from '@lms/shared-kernel';

export type TableWithId = PgTable & {
  id: PgColumn;
  $inferSelect: Record<string, any>;
  $inferInsert: Record<string, any>;
};

export abstract class BaseRepository<TTable extends TableWithId, TEntity> implements Repository<TEntity> {
  protected abstract readonly table: TTable;

  constructor(protected readonly tx: TransactionManager) { }

  protected get db(): Database {
    return this.tx.current;
  }

  protected abstract toDomain(row: TTable['$inferSelect']): TEntity;
  protected abstract toPersistence(entity: TEntity): TTable['$inferInsert'];

  protected async execute<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      mapDbError(error);
    }
  }

  async findById(id: string): Promise<TEntity | null> {
    return await this.execute<TEntity | null>(async () => {
      const rows = await this.db
        .select()
        .from(this.table as PgTable)
        .where(eq(this.table.id, id))
        .limit(1);
      return rows[0] ? this.toDomain(rows[0] as TTable['$inferSelect']) : null;
    })
  }

  async save(entity: TEntity): Promise<void> {
    const values = this.toPersistence(entity);
    await this.execute(() =>
      this.db
        .insert(this.table)
        .values(values)
        .onConflictDoUpdate({
          target: this.table.id,
          set: values,
        }),
    );
  }

  async delete(id: string): Promise<void> {
    await this.execute(() =>
      this.db
        .delete(this.table)
        .where(eq(this.table.id, id)),
    );
  }
}