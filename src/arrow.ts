import { Array } from './global';
import type { Narrow, Intersect } from './type';
import { singleton } from './function';

type Function = (...args: unknown[]) => unknown;
type ParamNs<FS extends readonly Function[], I extends number, E = never> = { [P in keyof FS]: FS[P] extends FS[number] ? Exclude<Parameters<FS[P]>[I], E> : FS[P]; };
type Returns<FS extends readonly Function[]> = { [P in keyof FS]: FS[P] extends FS[number] ? ReturnType<FS[P]> : FS[P]; };
type Context<FS extends readonly Function[]> = Intersect<Narrow<{ [P in keyof FS]: FS[P] extends (this: infer C, ...args: unknown[]) => unknown ? C : never; }>>;

export function bundle<fs extends ((this: undefined, a?: unknown) => unknown)[]>(...fs: fs): (...bs: ParamNs<fs, 0>) => Returns<fs>;
export function bundle<fs extends ((a?: unknown) => unknown)[]>(...fs: fs): (this: Context<fs>, ...bs: ParamNs<fs, 0>) => Returns<fs>;
export function bundle<fs extends ((a?: unknown) => unknown)[]>(...fs: fs): (this: Context<fs>, ...bs: ParamNs<fs, 0>) => Returns<fs> {
  return function (...bs) {
    return fs.map((f, i) => f.call(this, bs[i])) as Returns<fs>;
  };
}

export function aggregate<fs extends ((this: undefined, a?: undefined) => unknown)[]>(...fs: fs): (a?: Intersect<Narrow<ParamNs<fs, 0, undefined>>>) => Returns<fs>;
export function aggregate<fs extends ((a?: undefined) => unknown)[]>(...fs: fs): (this: Context<fs>, a?: Intersect<Narrow<ParamNs<fs, 0, undefined>>>) => Returns<fs>;
export function aggregate<fs extends ((this: undefined, a?: unknown) => unknown)[]>(...fs: fs): (a: Intersect<Narrow<ParamNs<fs, 0, undefined>>>) => Returns<fs>;
export function aggregate<fs extends ((a?: unknown) => unknown)[]>(...fs: fs): (this: Context<fs>, a: Intersect<Narrow<ParamNs<fs, 0, undefined>>>) => Returns<fs>;
export function aggregate<fs extends ((a?: unknown) => unknown)[]>(...fs: fs): (this: Context<fs>, a: Intersect<Narrow<ParamNs<fs, 0, undefined>>>) => Returns<fs> {
  return function (a) {
    return fs.map(f => f.call(this, a)) as Returns<fs>;
  };
}

export function assemble<fs extends ((this: undefined, a?: undefined) => () => void)[]>(...fs: fs): (a?: Intersect<Narrow<ParamNs<fs, 0, undefined>>>) => () => undefined;
export function assemble<fs extends ((a?: undefined) => () => void)[]>(...fs: fs): (this: Context<fs>, a?: Intersect<Narrow<ParamNs<fs, 0, undefined>>>) => () => undefined;
export function assemble<fs extends ((this: undefined, a?: unknown) => () => void)[]>(...fs: fs): (a: Intersect<Narrow<ParamNs<fs, 0, undefined>>>) => () => undefined;
export function assemble<fs extends ((a?: unknown) => () => void)[]>(...fs: fs): (this: Context<fs>, a: Intersect<Narrow<ParamNs<fs, 0, undefined>>>) => () => undefined;
export function assemble<fs extends ((a?: unknown) => () => void)[]>(...fs: fs): (this: Context<fs>, a: Intersect<Narrow<ParamNs<fs, 0, undefined>>>) => () => undefined {
  return function (a) {
    const gs: (() => void)[] = Array(16);
    try {
      for (let i = 0; i < fs.length; ++i) {
        gs[i] = fs[i].call(this, a);
      }
      return singleton(() => void cancel(gs));
    }
    catch (reason) {
      cancel(gs);
      throw reason;
    }
  };
}

function cancel(cancellers: readonly (() => void)[]): unknown[] {
  const reasons = [];
  for (let i = 0, g: () => void; g = cancellers[i]; ++i) {
    try {
      g();
    }
    catch (reason) {
      reasons.push(reason);
    }
  }
  return reasons;
}
