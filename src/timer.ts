import { setTimeout, clearTimeout } from './global';
import { List } from './invlist';
import { clock } from './clock';
import { singleton, noop } from './function';

interface Timer {
  <T>(timeout: number, handler: () => T, unhandler?: (result: Awaited<T>) => void): () => void;
  group(): GroupTimer;
}
interface GroupTimer {
  <T>(timeout: number, handler: () => T, unhandler?: (result: Awaited<T>) => void): () => void;
  clear(): void;
}

export const setTimer = template(false);
export const setRepeatTimer = template(true);

function template(repeat: boolean): Timer;
function template(repeat: boolean, cancellers: List<() => void>): GroupTimer;
function template(repeat: boolean, cancellers?: List<() => void>): Timer | GroupTimer {
  const timer = ((timeout, handler, unhandler?): () => void => {
    let params: [Awaited<ReturnType<typeof handler>>];
    let id = setTimeout(async function loop() {
      params = [await handler()];
      if (!repeat) return;
      id = setTimeout(loop, timeout);
    }, timeout);
    const cancel = singleton(() => {
      clearTimeout(id);
      node?.delete();
      params && unhandler?.(params[0]);
    });
    const node = cancellers?.push(cancel);
    return cancel;
  }) as Timer & GroupTimer;
  if (!cancellers) {
    timer.group = () => template(repeat, new List());
  }
  else {
    timer.clear = () => {
      while (cancellers.length) {
        cancellers.shift()!();
      }
    };
  }
  return timer;
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
