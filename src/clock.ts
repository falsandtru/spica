import { setTimeout } from './global';
import { AtomicPromise } from './promise';
import { noop } from './noop';

export { tick } from './clock.tick';

export const clock: Promise<undefined> = Promise.resolve(undefined);

export function wait(ms: number): AtomicPromise<undefined> {
  assert(ms >= 0);
  return ms === 0
    ? AtomicPromise.resolve(clock)
    : new AtomicPromise(resolve => void setTimeout(resolve, ms));
}

export const never: AtomicPromise<never> = new class Never extends AtomicPromise<never> {
  public static get [Symbol.species]() {
    return Never;
  }
  constructor() {
    super(noop);
  }
  public then() {
    return this;
  }
  public catch() {
    return this;
  }
  public finally() {
    return this;
  }
}();
