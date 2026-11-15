// Domain primitives
export { Entity } from './lib/domain/entity';
export { AggregateRoot } from './lib/domain/aggregate-root';
export { ValueObject } from './lib/domain/value-object';
export type { DomainEvent } from './lib/domain/domain-event';

// Error base
export { DomainError } from './lib/errors/domain-error';
export { NotFoundError, ConflictError, ReferenceError } from './lib/errors/common.errors';

// Types / utilities
export { Result } from './lib/types/result';

