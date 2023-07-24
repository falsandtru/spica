import { MonadPlus } from '../monadplus';

export class Sequence<a, z> extends MonadPlus<a> implements Iterable<a> {
  constructor(
    protected readonly cons: (z: z, cons: (a?: a, z?: z) => Sequence.Data<a, z>) => Sequence.Data<a, z>
  ) {
    super(throwCallError);
  }
  public [Symbol.iterator](): Iterator<a, undefined, undefined> {
    let iter = () => this.iterate();
    return {
      next() {
        const thunk = iter();
        iter = Sequence.Thunk.iterator(thunk);
        return {
          done: !Sequence.isIterable(thunk),
          value: Sequence.Thunk.value(thunk)
        } as IteratorResult<a, undefined>;
      }
    };
  }
}
export namespace Sequence {
  export declare function resume<a>(iterator: Sequence.Iterator<a>): Sequence<a, Sequence.Iterator<a>>;
  export declare function from<a>(as: Iterable<a>): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]>;
  export declare function cycle<a>(as: Iterable<a>): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]>;
  export declare function random(): Sequence<number, [number, Map<number, Sequence.Thunk<number>>]>;
  export declare function random<a>(gen: () => a): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]>;
  export declare function random<a>(as: a[]): Sequence<a, Sequence.Iterator<number>>;
  export declare function concat<a>(as: Sequence<Sequence<a, unknown>, unknown>): Sequence<a, [Sequence.Iterator<Sequence<a, unknown>>, Sequence.Iterator<a>]>;
  export declare function zip<a, b>(a: Sequence<a, unknown>, b: Sequence<b, unknown>): Sequence<[a, b], [Sequence.Iterator<a>, Sequence.Iterator<b>]>;
  export declare function difference<a>(a: Sequence<a, unknown>, b: Sequence<a, unknown>, cmp: (l: a, r: a) => number): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
  export declare function union<a>(a: Sequence<a, unknown>, b: Sequence<a, unknown>, cmp: (l: a, r: a) => number): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
  export declare function intersect<a>(a: Sequence<a, unknown>, b: Sequence<a, unknown>, cmp: (l: a, r: a) => number): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
  export declare function fmap<a, b>(f: (a: a) => b, m: Sequence<a, unknown>): Sequence<b, Sequence.Iterator<a>>;
  export declare function pure<a>(a: a): Sequence<a, number>;
  export declare function ap<a, b>(mf: Sequence<(a: a) => b, unknown>, ma: Sequence<a, unknown>): Sequence<b, [Sequence.Iterator<Sequence<b, unknown>>, Sequence.Iterator<b>]>;
  export declare function ap<a, b>(mf: Sequence<(a: a) => b, unknown>): (ma: Sequence<a, unknown>) => Sequence<b, [Sequence.Iterator<Sequence<b, unknown>>, Sequence.Iterator<b>]>;
  export declare const Return: typeof pure;
  export declare function bind<a, b>(f: (a: a) => Sequence<b, unknown>, m: Sequence<a, unknown>): Sequence<b, Sequence.Iterator<a>>;
  export declare function sequence<b>(ms: Sequence<b, unknown>[]): Sequence<Sequence<b, [Sequence.Iterator<b>, Sequence.Iterator<b>]>, Sequence.Iterator<Sequence<b, [Sequence.Iterator<b>, Sequence.Iterator<b>]>>>;
  export declare const mempty: Sequence<never, never>;
  export declare function mappend<a>(l: Sequence<a, unknown>, r: Sequence<a, unknown>): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
  export declare function mconcat<a>(as: Iterable<Sequence<a, unknown>>): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
  export declare const mzero: Sequence<never, never>;
  export declare function mplus<a>(l: Sequence<a, unknown>, r: Sequence<a, unknown>): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
}
export interface Sequence<a, z> {
  extract(): a[];
  [Symbol.iterator](): Iterator<a>;
  iterate(): Sequence.Thunk<a>;
  fmap<b>(f: (a: a) => b): Sequence<b, Sequence.Iterator<a>>;
  ap<a, z>(this: Sequence<(a: a) => z, unknown>, a: Sequence<a, unknown>): Sequence<z, [Sequence.Iterator<Sequence<z, unknown>>, Sequence.Iterator<z>]>;
  ap<a, b, z>(this: Sequence<(a: a, b: b) => z, unknown>, a: Sequence<a, unknown>): Sequence<(b: b) => z, [Sequence.Iterator<Sequence<z, unknown>>, Sequence.Iterator<z>]>;
  ap<a, b, c, z>(this: Sequence<(a: a, b: b, c: c) => z, unknown>, a: Sequence<a, unknown>): Sequence<(b: b, c: c) => z, [Sequence.Iterator<Sequence<z, unknown>>, Sequence.Iterator<z>]>;
  ap<a, b, c, d, z>(this: Sequence<(a: a, b: b, c: c, d: d) => z, unknown>, a: Sequence<a, unknown>): Sequence<(b: b, c: c, d: d) => z, [Sequence.Iterator<Sequence<z, unknown>>, Sequence.Iterator<z>]>;
  ap<a, b, c, d, e, z>(this: Sequence<(a: a, b: b, c: c, d: d, e: e) => z, unknown>, a: Sequence<a, unknown>): Sequence<(b: b, c: c, d: d, e: e) => z, [Sequence.Iterator<Sequence<z, unknown>>, Sequence.Iterator<z>]>;
  bind<b>(f: (a: a) => Sequence<b, unknown>): Sequence<b, [Sequence.Iterator<Sequence<b, unknown>>, Sequence.Iterator<b>]>;
  join<b>(this: Sequence<Sequence<b, unknown>, unknown>): Sequence<b, [Sequence.Iterator<Sequence<b, unknown>>, Sequence.Iterator<b>]>;
  mapM<b>(f: (a: a) => Sequence<b, unknown>): Sequence<b[], [Sequence.Iterator<Sequence<b[], unknown>>, Sequence.Iterator<b[]>]>;
  filterM(f: (a: a) => Sequence<boolean, unknown>): Sequence<a[], [Sequence.Iterator<Sequence<a[], unknown>>, Sequence.Iterator<a[]>]>;
  map<b>(f: (a: a, i: number) => b): Sequence<b, Sequence.Iterator<a>>;
  filter(f: (a: a, i: number) => boolean): Sequence<a, Sequence.Iterator<a>>;
  scanl<b>(f: (b: b, a: a) => b, z: b): Sequence<b, [b, Sequence.Iterator<a>, number]>;
  foldr<b>(f: (a: a, b: Sequence<b, unknown>) => Sequence<b, unknown>, z: Sequence<b, unknown>): Sequence<b, [Sequence.Iterator<Sequence<b, unknown>>, Sequence.Iterator<b>]>;
  group(f: (x: a, y: a) => boolean): Sequence<a[], [Sequence.Iterator<a>, a[]]>;
  inits(): Sequence<a[], [Sequence.Iterator<a[]>, Sequence.Iterator<a[]>]>
  tails(): Sequence<a[], [Sequence.Iterator<a[]>, Sequence.Iterator<a[]>]>
  segs(): Sequence<a[], [Sequence.Iterator<a[]>, Sequence.Iterator<a[]>]>;
  subsequences(): Sequence<a[], [Sequence.Iterator<a[]>, Sequence.Iterator<a[]>]>;
  permutations(): Sequence<a[], [Sequence.Iterator<Sequence<a[], unknown>>, Sequence.Iterator<a[]>]>;
  take(n: number): Sequence<a, Sequence.Iterator<a>>;
  drop(n: number): Sequence<a, Sequence.Iterator<a>>;
  takeWhile(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>>;
  dropWhile(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>>;
  takeUntil(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>>;
  dropUntil(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>>;
  sort(cmp?: (a: a, b: a) => number): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]>;
  unique(): Sequence<a, Sequence.Iterator<a>>;
  memoize(): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]>;
  reduce(): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]>;
}

export namespace Sequence {
  export type Data<a, z> = [] | [a] | [a, z];
  export namespace Data {
    export function cons<a, z>(): [];
    export function cons<a, z>(a: a): [a];
    export function cons<a, z>(a: a, z: z): [a, z];
    export function cons<a, z>(a?: a, z?: z): Data<a, z> {
      switch (arguments.length) {
        case 0:
          return [];
        case 1:
          return [a!];
        case 2:
          return [a!, z!];
        default:
          throw Sequence.Exception.invalidConsError(arguments);
      }
    }
  }
  export type Thunk<a> = [a, Iterator<a>, number];
  export namespace Thunk {
    export function value<a>(thunk: Thunk<a>): a {
      return thunk[0];
    }
    export function iterator<a>(thunk: Thunk<a>): Iterator<a> {
      return thunk[1];
    }
    export function index<a>(thunk: Thunk<a>): number {
      return thunk[2];
    }
  }
  export type Iterator<a> = () => Thunk<a>;
  export namespace Iterator {
    export const done: Sequence.Iterator<never> = () => <Sequence.Thunk<never>>[undefined, done, -1];
    export function when<a, b>(
      thunk: Thunk<a>,
      caseDone: (thunk: Thunk<a>) => b,
      caseIterable: (thunk: Thunk<a>, recur: () => b) => b
    ): b {
      return Sequence.isIterable(thunk)
        ? caseIterable(thunk, () => when(Thunk.iterator(thunk)(), caseDone, caseIterable))
        : caseDone(thunk);
    }
  }
  export function isIterable(thunk: Thunk<unknown>): boolean {
    return Thunk.iterator(thunk) !== Iterator.done;
  }
  export namespace Exception {
    export function invalidConsError(args: IArguments): TypeError {
      console.error(args, args.length, args[0], args[1]);
      return new TypeError(`Spica: Sequence: Invalid parameters of cons.`);
    }
    export function invalidDataError(data: unknown[]): TypeError {
      console.error(data);
      return new TypeError(`Spica: Sequence: Invalid data.`);
    }
    export function invalidThunkError(thunk: Sequence.Thunk<unknown>): TypeError {
      console.error(thunk);
      return new TypeError(`Spica: Sequence: Invalid thunk.`);
    }
  }
}

function throwCallError(): never {
  throw new Error(`Spica: Sequence: Invalid thunk call.`);
}
