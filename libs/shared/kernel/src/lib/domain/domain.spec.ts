import { Entity } from './entity';
import { AggregateRoot } from './aggregate-root';
import { ValueObject } from './value-object';
import { DomainEvent } from './domain-event';
import { Result } from '../types/result';
import { DomainError } from '../errors/domain-error';

// ─── Entity ───────────────────────────────────────────────────────────────────

class UserEntity extends Entity<string> {
  constructor(id: string, public readonly name: string) {
    super(id);
  }
}

describe('Entity', () => {
  it('is equal to itself', () => {
    const user = new UserEntity('user-1', 'Alice');
    expect(user.equals(user)).toBe(true);
  });

  it('is equal to another entity of the same class with the same id', () => {
    const a = new UserEntity('user-1', 'Alice');
    const b = new UserEntity('user-1', 'Bob');
    expect(a.equals(b)).toBe(true);
  });

  it('is not equal to an entity with a different id', () => {
    const a = new UserEntity('user-1', 'Alice');
    const b = new UserEntity('user-2', 'Alice');
    expect(a.equals(b)).toBe(false);
  });

  it('is not equal to undefined', () => {
    const user = new UserEntity('user-1', 'Alice');
    expect(user.equals(undefined)).toBe(false);
  });
});

// ─── AggregateRoot ────────────────────────────────────────────────────────────

class OrderPlaced implements DomainEvent {
  readonly eventName = 'order.placed';
  readonly occurredOn = new Date();
  constructor(readonly aggregateId: string) {}
}

class OrderAggregate extends AggregateRoot<string> {
  constructor(id: string) {
    super(id);
    this.addDomainEvent(new OrderPlaced(id));
  }
}

describe('AggregateRoot', () => {
  it('collects domain events', () => {
    const order = new OrderAggregate('order-1');
    expect(order.domainEvents).toHaveLength(1);
    expect(order.domainEvents[0].eventName).toBe('order.placed');
  });

  it('clears domain events', () => {
    const order = new OrderAggregate('order-1');
    order.clearDomainEvents();
    expect(order.domainEvents).toHaveLength(0);
  });
});

// ─── ValueObject ──────────────────────────────────────────────────────────────

class Money extends ValueObject<{ amount: number; currency: string }> {
  static of(amount: number, currency: string): Money {
    return new Money({ amount, currency });
  }
}

describe('ValueObject', () => {
  it('is equal when props match', () => {
    expect(Money.of(100, 'USD').equals(Money.of(100, 'USD'))).toBe(true);
  });

  it('is not equal when props differ', () => {
    expect(Money.of(100, 'USD').equals(Money.of(200, 'USD'))).toBe(false);
  });

  it('is not equal to undefined', () => {
    expect(Money.of(100, 'USD').equals(undefined)).toBe(false);
  });
});

// ─── Result ───────────────────────────────────────────────────────────────────

describe('Result', () => {
  it('creates a success result', () => {
    const res = Result.ok('success-data');
    expect(res.isSuccess).toBe(true);
    if (res.isSuccess) {
      expect(res.value).toBe('success-data');
    }
  });

  it('creates a failure result', () => {
    const err = new Error('failed');
    const res = Result.fail(err);
    expect(res.isSuccess).toBe(false);
    if (!res.isSuccess) {
      expect(res.error).toBe(err);
    }
  });
});

// ─── DomainError ──────────────────────────────────────────────────────────────

class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User ${userId} not found`, 'USER_NOT_FOUND');
  }
}

describe('DomainError', () => {
  it('sets message and code correctly', () => {
    const err = new UserNotFoundError('123');
    expect(err.message).toBe('User 123 not found');
    expect(err.code).toBe('USER_NOT_FOUND');
    expect(err.name).toBe('UserNotFoundError');
    expect(err instanceof DomainError).toBe(true);
    expect(err instanceof Error).toBe(true);
  });
});

