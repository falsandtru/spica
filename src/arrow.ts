import type { Narrow, Intersect } from './type';
import { singleton } from './function';

type Functions2Parameters<FS extends readonly ((..._: unknown[]) => unknown)[]> = { [P in keyof FS]: FS[P] extends FS[number] ? Parameters<FS[P]>[0] : never; };
type Functions2Returns<FS extends readonly ((..._: unknown[]) => unknown)[]> = { [P in keyof FS]: FS[P] extends FS[number] ? ReturnType<FS[P]> : never; };
type Functions2Context<FS extends readonly ((..._: unknown[]) => unknown)[]> = FS[number] extends (this: infer C, ..._: unknown[]) => unknown ? C : never;
type Functions2Parameters2<FS extends readonly ((..._: unknown[]) => unknown)[]> = { [P in keyof FS]: FS[P] extends FS[number] ? FS[P] extends (_?: undefined) => unknown ? never : Parameters<FS[P]>[0] : never; };

export function bundle<fs extends ((this: undefined, a: unknown) => unknown)[]>(...fs: fs): (...bs: Functions2Parameters<fs>) => Functions2Returns<fs>;
export function bundle<fs extends ((a: unknown) => unknown)[]>(...fs: fs): (this: Functions2Context<fs>, ...bs: Functions2Parameters<fs>) => Functions2Returns<fs>;
export function bundle<fs extends ((a: unknown) => unknown)[]>(...fs: fs): (this: Functions2Context<fs>, ...bs: Functions2Parameters<fs>) => Functions2Returns<fs> {
  return function (...bs) {
    return fs.map((f, i) => f.call(this, bs[i])) as any;
  };
}

export function aggregate<fs extends ((this: undefined) => unknown)[]>(...fs: fs): () => Functions2Returns<fs>;
export function aggregate<fs extends (() => unknown)[]>(...fs: fs): (this: Functions2Context<fs>) => Functions2Returns<fs>;
export function aggregate<fs extends ((this: undefined, a?: unknown) => unknown)[]>(...fs: fs): (a: Intersect<Narrow<Functions2Parameters2<fs>>>) => Functions2Returns<fs>;
export function aggregate<fs extends ((a?: unknown) => unknown)[]>(...fs: fs): (this: Functions2Context<fs>, a: Intersect<Narrow<Functions2Parameters2<fs>>>) => Functions2Returns<fs>;
export function aggregate<fs extends ((a?: unknown) => unknown)[]>(...fs: fs): (this: Functions2Context<fs>, a: Intersect<Narrow<Functions2Parameters2<fs>>>) => Functions2Returns<fs> {
  return function (a) {
    return fs.map(f => f.call(this, a)) as any;
  };
}

export function run(app: () => readonly (() => void)[]): () => undefined {
  const fs = app();
  return singleton((): undefined => {
    const rs = [];
    for (let i = 0; fs[i]; ++i) {
      try {
        fs[i]();
      }
      catch (reason) {
        rs.push(reason);
      }
    }
    if (rs.length > 0) {
      throw new AggregateError(rs);
    }
    return;
  });
}
