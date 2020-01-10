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
