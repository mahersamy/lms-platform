/** Object defined by its identity. Equal = same class + same id. */
export abstract class Entity<TId> {
  protected constructor(protected readonly _id: TId) {}

  get id(): TId {
    return this._id;
  }

  equals(other?: Entity<TId>): boolean {
    return !!other && this.constructor === other.constructor && this._id === other._id;
  }
}