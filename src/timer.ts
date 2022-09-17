import { setTimeout, clearTimeout } from './global';
import { clock } from './clock';
import { singleton, noop } from './function';

export const setTimer = template(false);
export const setRepeatTimer = template(true);

function template(repeat: boolean) {
  return <a>(timeout: number, handler: () => a, unhandler?: (a: Awaited<a>) => void): () => void => {
    let params: [Awaited<a>];
    let id = setTimeout(async function loop() {
      params = [await handler()];
      if (!repeat) return;
      id = setTimeout(loop, timeout);
    }, timeout);
    return singleton(() => {
      clearTimeout(id);
      params && unhandler?.(params[0]);
    });
  };
}

export function captureTimers(test: (done: (err?: unknown) => void) => unknown): (done: (err?: unknown) => unknown) => void {
  const start = setTimeout(noop) as any;
  clearTimeout(start);
  if (typeof start !== 'number') throw new Error('Timer ID must be a number');
  return done => test(err => {
    // Must get the ID before calling done.
    const end = setTimeout(noop) as unknown as number;
    done(err);
    clearTimeout(end);
    for (let i = start; i < end; ++i) {
      clearTimeout(i);
    }
  });
}

export function wait(ms: number): Promise<undefined> {
  assert(ms >= 0);
  return ms === 0
    ? clock
    : new Promise<undefined>(resolve => void setTimeout(resolve, ms));
}
