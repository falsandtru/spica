import { AtomicPromise } from './promise';
export { tick } from './clock.tick';

export const clock: Promise<void> = Promise.resolve();

export function wait(ms: number): AtomicPromise<void> {
  assert(ms >= 0);
  return new AtomicPromise(resolve => void setTimeout(resolve, ms));
}
