import { ConflictError, ReferenceError } from '@lms/shared-kernel';

export function mapDbError(error: unknown): never {
  const pg = (error as { cause?: unknown })?.cause ?? error;
  const code = (pg as { code?: string })?.code;

  if (code === '23505') {
    throw new ConflictError('Resource already exists');
  }

  if (code === '23503') {
    throw new ReferenceError('Related resource not found');
  }

  throw error;
}