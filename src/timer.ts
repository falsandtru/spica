import { setTimeout, clearTimeout } from './global';
import { singleton } from './function';

export const setTimer = template(1);
export const setRepeatTimer = template(Infinity);

function template(count: number) {
  return <a>(time: number, handler: () => a, unhandler?: (a: Awaited<a>) => void): () => void => {
    let params: [Awaited<a>];
    let id = setTimeout(async function loop() {
      params = [await handler()];
      if (--count === 0) return;
      id = setTimeout(loop, time);
    }, time);
    return singleton(() => {
      clearTimeout(id);
      params && unhandler?.(params[0]);
    });
  };
}

export function wait(ms: number): Promise<undefined> {
  assert(ms >= 0);
  return ms === 0
    ? Promise.resolve(void 0)
    : new Promise<undefined>(resolve => void setTimeout(resolve, ms));
}
