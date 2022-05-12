export abstract class Lazy<a> {
  constructor(protected readonly thunk: () => Lazy<a>) {
  }
  private $memory?: this = void 0;
  protected evaluate(): this {
    return this.$memory ??= this.thunk() as this;
  }
  public abstract extract(): unknown;
}
