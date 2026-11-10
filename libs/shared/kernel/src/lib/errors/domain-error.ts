/** Business error with a machine-readable `code` (e.g. "USER_NOT_FOUND"). */
export abstract class DomainError extends Error {
  protected constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}