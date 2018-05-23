export { tick } from './clock.tick';

export const clock: Promise<void> = Promise.resolve();

export function wait(ms: number): Promise<void> {
  assert(ms >= 0);
  return new Promise(resolve => void setTimeout(resolve, ms));
}
