/** A fact that happened in the domain, e.g. eventName "identity.user.registered". */
export interface DomainEvent {
  readonly eventName: string;
  readonly occurredOn: Date;
  readonly aggregateId: string;
}