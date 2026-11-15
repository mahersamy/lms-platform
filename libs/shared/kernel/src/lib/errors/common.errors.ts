import { DomainError } from './domain-error';

export class NotFoundError extends DomainError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND');
  }
}

export class ConflictError extends DomainError {
  constructor(message = 'Resource already exists') {
    super(message, 'CONFLICT');
  }
}

export class ReferenceError extends DomainError { 
  constructor(message = 'Related resource not found') {
    super(message, 'FK_VIOLATION');
  }
}