export abstract class Lazy<a> {
  constructor(protected readonly thunk: () => Lazy<a>) {
  }
  private memory_?: this;
  protected evaluate(): this {
    return this.memory_ = this.memory_ || this.thunk!() as this;
  }
  public abstract extract(): any;
}
