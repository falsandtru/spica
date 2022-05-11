import { global } from './global';
import { singleton } from './function';

export const setTimeout = template(1);
export const setInterval = template(Infinity);

function template(count: number) {
  const { setTimeout, clearTimeout } = global;
  return <a>(wait: number, handler: () => a, unhandler?: (a: a) => void): () => void => {
    let params: [a];
    let timer = global.setTimeout(function loop() {
      params = [handler()];
      if (--count === 0) return;
      timer = setTimeout(loop, wait);
    }, wait);
    return singleton(() => {
      clearTimeout(timer);
      params && unhandler?.(params[0]);
    });
  };
}

export function wait(ms: number): Promise<undefined> {
  assert(ms >= 0);
  return ms === 0
    ? Promise.resolve(void 0)
    : new Promise<undefined>(resolve => void global.setTimeout(resolve, ms));
}
