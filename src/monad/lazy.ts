import { undefined } from '../global';

export abstract class Lazy<a> {
  constructor(protected readonly thunk: () => Lazy<a>) {
  }
  private memory_?: this = undefined;
  protected evaluate(): this {
    return this.memory_
      ? this.memory_
      : this.memory_ = this.thunk() as this;
  }
  public abstract extract(): unknown;
}
