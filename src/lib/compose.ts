import {assign} from './assign';
import {concat} from './concat';

export function compose<T extends new (...args: any[]) => any>(target: T, ...sources: T[]): T {
  return concat([target], sources)
    .reduce((b, d) => {
      void assign(b.prototype, d.prototype);
      for (const p in d) if (d.hasOwnProperty(p)) b[p] = d[p];
      return b;
    });
}
