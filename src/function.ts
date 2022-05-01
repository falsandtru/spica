import { noop } from './noop';

export function singleton<f extends (...args: unknown[]) => unknown>(f: f): f {
  let result: unknown;
  return function (this: unknown, ...as) {
    if (f === noop) return result;
    result = f.call(this, ...as);
    f = noop as f;
    return result;
  } as f;
}

export function clear<as extends unknown[]>(f: (...as: as) => void): (...as: as) => undefined {
  return (...as) => void f(...as);
}
