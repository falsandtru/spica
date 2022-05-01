import type { Narrow, Intersect } from './type';
import { singleton } from './function';

type Function = (...args: unknown[]) => unknown;
type ParamNs<FS extends readonly Function[], I extends number, F extends Function = never> = { [P in keyof FS]: FS[P] extends FS[number] ? Parameters<Exclude<FS[P], F>>[I] : FS[P]; };
type Returns<FS extends readonly Function[]> = { [P in keyof FS]: FS[P] extends FS[number] ? ReturnType<FS[P]> : FS[P]; };
type Context<FS extends readonly Function[]> = Intersect<Narrow<{ [P in keyof FS]: FS[P] extends (this: infer C, ...args: unknown[]) => unknown ? C : never; }>>;

export function bundle<fs extends ((this: undefined, a: unknown) => unknown)[]>(...fs: fs): (...bs: ParamNs<fs, 0>) => Returns<fs>;
export function bundle<fs extends ((a: unknown) => unknown)[]>(...fs: fs): (this: Context<fs>, ...bs: ParamNs<fs, 0>) => Returns<fs>;
export function bundle<fs extends ((a: unknown) => unknown)[]>(...fs: fs): (this: Context<fs>, ...bs: ParamNs<fs, 0>) => Returns<fs> {
  return function (...bs) {
    return fs.map((f, i) => f.call(this, bs[i])) as Returns<fs>;
  };
}

export function aggregate<fs extends ((this: undefined) => unknown)[]>(...fs: fs): () => Returns<fs>;
export function aggregate<fs extends (() => unknown)[]>(...fs: fs): (this: Context<fs>) => Returns<fs>;
export function aggregate<fs extends ((this: undefined, a?: unknown) => unknown)[]>(...fs: fs): (a: Intersect<Narrow<ParamNs<fs, 0, () => unknown>>>) => Returns<fs>;
export function aggregate<fs extends ((a?: unknown) => unknown)[]>(...fs: fs): (this: Context<fs>, a: Intersect<Narrow<ParamNs<fs, 0, () => unknown>>>) => Returns<fs>;
export function aggregate<fs extends ((a?: unknown) => unknown)[]>(...fs: fs): (this: Context<fs>, a: Intersect<Narrow<ParamNs<fs, 0, () => unknown>>>) => Returns<fs> {
  return function (a) {
    return fs.map(f => f.call(this, a)) as Returns<fs>;
  };
}

export function assemble<fs extends ((this: undefined) => () => void)[]>(...fs: fs): () => () => undefined;
export function assemble<fs extends (() => () => void)[]>(...fs: fs): (this: Context<fs>) => () => undefined;
export function assemble<fs extends ((this: undefined, a?: unknown) => () => void)[]>(...fs: fs): (a: Intersect<Narrow<ParamNs<fs, 0, () => unknown>>>) => () => undefined;
export function assemble<fs extends ((a?: unknown) => () => void)[]>(...fs: fs): (this: Context<fs>, a: Intersect<Narrow<ParamNs<fs, 0, () => unknown>>>) => () => undefined;
export function assemble<fs extends ((a?: unknown) => () => void)[]>(...fs: fs): (this: Context<fs>, a: Intersect<Narrow<ParamNs<fs, 0, () => unknown>>>) => () => undefined {
  return function (a) {
    const gs: (() => void)[] = [];
    try {
      for (let i = 0; i < fs.length; ++i) {
        gs.push(fs[i].call(this, a));
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
  for (let i = 0; i < cancellers.length; ++i) {
    try {
      (void 0, cancellers[i])();
    }
    catch (reason) {
      reasons.push(reason);
    }
  }
  return reasons;
}
