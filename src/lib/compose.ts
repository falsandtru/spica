import {assign} from './assign';

export function compose<T extends new (...args: any[]) => Object>(target: T, ...sources: T[]): T {
  return sources
    .reduce((b, d) => {
      void assign(b.prototype, d.prototype);
      for (const p in d) if (d.hasOwnProperty(p)) b[p] = d[p];
      return b;
    }
    , target);
}
