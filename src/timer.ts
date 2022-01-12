import { setTimeout } from './global';
import { clock } from './clock';
import { AtomicPromise } from './promise';

export function wait(ms: number): AtomicPromise<undefined> {
  assert(ms >= 0);
  return ms === 0
    ? AtomicPromise.resolve(clock)
    : new AtomicPromise(resolve => void setTimeout(resolve, ms));
}
