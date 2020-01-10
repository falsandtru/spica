import { global } from './global';
import { AtomicPromise } from './promise';
export { tick } from './clock.tick';

const { setTimeout } = global;

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
    super(() => undefined);
  }
  public then() {
    return super.then();
  }
  public catch() {
    return super.then();
  }
  public finally() {
    return super.then();
  }
}();
