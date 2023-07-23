import { Narrow, Intersect } from './type';
import { singleton } from './function';

type Function = (...args: unknown[]) => unknown;
type ParamNs<FS extends readonly Function[], I extends number, E = never> =
  FS extends readonly [infer T1 extends Function, ...infer TS extends Function[]] ?
  [Exclude<Parameters<T1>[I], E>, ...ParamNs<TS, I, E>] :
  [];
type Context<FS extends readonly Function[]> = Intersect<Narrow<{ [P in keyof FS]: FS[P] extends (this: infer C, ...args: unknown[]) => unknown ? C : never; }>>;
type Returns<FS extends readonly Function[]> = { [P in keyof FS]: FS[P] extends FS[number] ? ReturnType<FS[P]> : FS[P]; };
type ReturnResults<FS extends readonly Function[]> = { readonly [P in keyof FS]: FS[P] extends FS[number] ? Result<ReturnType<FS[P]>> : FS[P]; };
type Result<T> =
  | { readonly value: T; readonly done: true; }
  | { readonly value: unknown; readonly done: false; };

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

export function assemble<fs extends ((this: undefined, a?: undefined) => (error?: Error) => void)[]>(...fs: fs): (a?: Intersect<Narrow<ParamNs<fs, 0, undefined>>>) => (error?: Error) => ReturnResults<Returns<fs>>;
export function assemble<fs extends ((a?: undefined) => (error?: Error) => void)[]>(...fs: fs): (this: Context<fs>, a?: Intersect<Narrow<ParamNs<fs, 0, undefined>>>) => (error?: Error) => ReturnResults<Returns<fs>>;
export function assemble<fs extends ((this: undefined, a?: unknown) => (error?: Error) => void)[]>(...fs: fs): (a: Intersect<Narrow<ParamNs<fs, 0, undefined>>>) => (error?: Error) => ReturnResults<Returns<fs>>;
export function assemble<fs extends ((a?: unknown) => (error?: Error) => void)[]>(...fs: fs): (this: Context<fs>, a: Intersect<Narrow<ParamNs<fs, 0, undefined>>>) => (error?: Error) => ReturnResults<Returns<fs>>;
export function assemble<fs extends ((a?: unknown) => (error?: Error) => void)[]>(...fs: fs): (this: Context<fs>, a: Intersect<Narrow<ParamNs<fs, 0, undefined>>>) => (error?: Error) => ReturnResults<Returns<fs>> {
  return function (a) {
    const gs: ((error?: Error) => void)[] = Array(fs.length);
    try {
      for (let i = 0; i < fs.length; ++i) {
        gs[i] = fs[i].call(this, a);
      }
      return singleton((error?: Error) => cancel(gs, error) as ReturnResults<Returns<fs>>);
    }
    catch (reason) {
      cancel(gs, reason instanceof Error ? reason : new Error('Spica: Arrow: assemble: Wrap the error value', { cause: reason }));
      throw reason;
    }
  };
}

function cancel<T>(cancellers: readonly ((error?: Error) => T)[], error?: Error): readonly Result<T>[] {
  const results: Result<T>[] = Array(cancellers.length);
  for (let i = 0, g: typeof cancellers[number]; g = cancellers[i]; ++i) {
    try {
      results[i] = { value: g(error), done: true };
    }
    catch (reason) {
      results[i] = { value: reason, done: false };
    }
  }
  return results;
}
