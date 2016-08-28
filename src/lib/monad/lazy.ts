export abstract class Lazy<a> {
  constructor(protected thunk: () => Lazy<a>) {
  }
  private memory_: this;
  protected evaluate(): this {
    return this.memory_ = this.memory_ || <this>this.thunk!();
  }
}
