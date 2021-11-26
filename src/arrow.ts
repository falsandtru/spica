import type { Narrow, Intersect } from './type';
import { singleton } from './function';

type Functions2Parameters<FS extends readonly ((..._: unknown[]) => unknown)[]> = { [P in keyof FS]: FS[P] extends FS[number] ? Parameters<FS[P]>[0] : never; };
type Functions2Returns<FS extends readonly ((..._: unknown[]) => unknown)[]> = { [P in keyof FS]: FS[P] extends FS[number] ? ReturnType<FS[P]> : never; };
type Functions2Context<FS extends readonly ((..._: unknown[]) => unknown)[]> = FS[number] extends (this: infer C, ..._: unknown[]) => unknown ? C : never;
type Functions2Parameters2<FS extends readonly ((..._: unknown[]) => unknown)[]> = { [P in keyof FS]: FS[P] extends FS[number] ? FS[P] extends (_?: undefined) => unknown ? never : Parameters<FS[P]>[0] : never; };

export function bundle<as extends ((this: undefined, b: unknown) => unknown)[]>(...as: as): (...bs: Functions2Parameters<as>) => Functions2Returns<as>;
export function bundle<as extends ((b: unknown) => unknown)[]>(...as: as): (this: Functions2Context<as>, ...bs: Functions2Parameters<as>) => Functions2Returns<as>;
export function bundle<as extends ((b: unknown) => unknown)[]>(...as: as): (this: Functions2Context<as>, ...bs: Functions2Parameters<as>) => Functions2Returns<as> {
  return function (...bs) {
    return as.map((f, i) => f.call(this, bs[i])) as any;
  };
}

export function aggregate<as extends ((this: undefined) => unknown)[]>(...as: as): () => Functions2Returns<as>;
export function aggregate<as extends (() => unknown)[]>(...as: as): (this: Functions2Context<as>) => Functions2Returns<as>;
export function aggregate<as extends ((this: undefined, b?: unknown) => unknown)[]>(...as: as): (b: Intersect<Narrow<Functions2Parameters2<as>>>) => Functions2Returns<as>;
export function aggregate<as extends ((b?: unknown) => unknown)[]>(...as: as): (this: Functions2Context<as>, b: Intersect<Narrow<Functions2Parameters2<as>>>) => Functions2Returns<as>;
export function aggregate<as extends ((b?: unknown) => unknown)[]>(...as: as): (this: Functions2Context<as>, b: Intersect<Narrow<Functions2Parameters2<as>>>) => Functions2Returns<as> {
  return function (b) {
    return as.map(f => f.call(this, b)) as any;
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
