import { setTimeout, clearTimeout } from './global';
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

export function captureTimers<as extends unknown[] = []>(callback?: (...as: as) => void): (...as: as) => void {
  const start = setTimeout(noop) as any;
  clearTimeout(start);
  if (typeof start !== 'number') throw new Error('Timer ID is not a number');
  return singleton((...as) => {
    const end = setTimeout(noop) as unknown as number;
    clearTimeout(end);
    for (let i = start; i < end; ++i) {
      clearTimeout(i);
    }
    callback?.(...as);
  });
}

export function wait(ms: number): Promise<undefined> {
  assert(ms >= 0);
  return ms === 0
    ? Promise.resolve(void 0)
    : new Promise<undefined>(resolve => void setTimeout(resolve, ms));
}
