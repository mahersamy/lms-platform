/** Immutable object defined by its props. Props must be JSON-serializable. */
export abstract class ValueObject<TProps extends object> {
  protected readonly props: Readonly<TProps>;

  protected constructor(props: TProps) {
    this.props = Object.freeze({ ...props });
  }

  equals(other?: ValueObject<TProps>): boolean {
    return (
      !!other &&
      this.constructor === other.constructor &&
      JSON.stringify(this.props) === JSON.stringify(other.props)
    );
  }
}