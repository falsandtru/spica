import {Sequence as ISequence} from 'spica';
import {MonadPlus} from '../monadplus';

type ESIterator<T> = Iterator<T>;

export class Sequence<a, z> extends MonadPlus<a> implements Iterable<a> {
  constructor(
    protected cons: (z: z, cons: (a?: a, z?: z) => Sequence.Data<a, z>) => Sequence.Data<a, z>,
    protected memory?: Map<number, Sequence.Data<a, z>>
  ) {
    super(throwCallError);
  }
  public [Symbol.iterator](): Iterator<a> {
    let iter = () => this.iterate();
    return {
      next() {
        const thunk = iter();
        iter = Sequence.Thunk.iterator(thunk);
        return {
          done: !Sequence.isIterable(thunk),
          value: Sequence.Thunk.value(thunk)
        };
      }
    };
  }
}
export namespace Sequence {
  export declare function resume<a>(iterator: Sequence.Iterator<a>): Sequence<a, Sequence.Iterator<a>>;
  export declare function from<a>(as: Iterable<a>): Sequence<a, [ESIterator<a>, number, Map<number, IteratorResult<a>>]>;
  export declare function cycle<a>(as: Iterable<a>): Sequence<a, [ESIterator<a>, number, Map<number, IteratorResult<a>>]>;
  export declare function random(): Sequence<number, [ESIterator<number>, number, Map<number, IteratorResult<number>>]>;
  export declare function random<a>(gen: () => a): Sequence<a, [ESIterator<a>, number, Map<number, IteratorResult<a>>]>;
  export declare function random<a>(as: a[]): Sequence<a, Sequence.Iterator<number>>;
  export declare function concat<a>(as: Sequence<Sequence<a, any>, any>): Sequence<a, [Sequence.Iterator<Sequence<a, any>>, Sequence.Iterator<a>]>;
  export declare function zip<a, b>(a: Sequence<a, any>, b: Sequence<b, any>): Sequence<[a, b], [Sequence.Iterator<a>, Sequence.Iterator<b>]>;
  export declare function difference<a>(a: Sequence<a, any>, b: Sequence<a, any>, cmp: (l: a, r: a) => number): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
  export declare function union<a>(a: Sequence<a, any>, b: Sequence<a, any>, cmp: (l: a, r: a) => number): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
  export declare function intersect<a>(a: Sequence<a, any>, b: Sequence<a, any>, cmp: (l: a, r: a) => number): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
  export declare function fmap<a, b>(m: Sequence<a, any>, f: (a: a) => b): Sequence<b, Sequence.Iterator<a>>;
  export declare function fmap<a>(m: Sequence<a, any>): <b>(f: (a: a) => b) => Sequence<b, Sequence.Iterator<a>>;
  export declare function pure<a>(a: a): Sequence<a, number>;
  export declare function ap<a, b>(mf: Sequence<(a: a) => b, any>, ma: Sequence<a, any>): Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]>;
  export declare function ap<a, b>(mf: Sequence<(a: a) => b, any>): (ma: Sequence<a, any>) => Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]>;
  export declare const Return: typeof pure;
  export declare function bind<a, b>(m: Sequence<a, any>, f: (a: a) => Sequence<b, any>): Sequence<b, Sequence.Iterator<a>>;
  export declare function bind<a>(m: Sequence<a, any>): <b>(f: (a: a) => Sequence<b, any>) => Sequence<b, Sequence.Iterator<a>>;
  export declare const mempty: Sequence<any, any>;
  export declare function mappend<a>(l: Sequence<a, any>, r: Sequence<a, any>): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
  export declare function mconcat<a>(as: Iterable<Sequence<a, any>>): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
  export declare const mzero: Sequence<any, any>;
  export declare function mplus<a>(l: Sequence<a, any>, r: Sequence<a, any>): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
}
export interface Sequence<a, z> {
  extract(): a[];
  [Symbol.iterator](): Iterator<a>;
  iterate(): Sequence.Thunk<a>;
  fmap<b>(f: (a: a) => b): Sequence<b, Sequence.Iterator<a>>;
  ap<a, z>(this: Sequence<(a: a) => z, any>, a: Sequence<a, any>): Sequence<z, [Sequence.Iterator<Sequence<z, any>>, Sequence.Iterator<z>]>;
  ap<a, b, z>(this: Sequence<(a: a, b: b) => z, any>, a: Sequence<a, any>): Sequence<(b: b) => z, [Sequence.Iterator<Sequence<z, any>>, Sequence.Iterator<z>]>;
  ap<a, b, c, z>(this: Sequence<(a: a, b: b, c: c) => z, any>, a: Sequence<a, any>): Sequence<(b: b, c: c) => z, [Sequence.Iterator<Sequence<z, any>>, Sequence.Iterator<z>]>;
  ap<a, b, c, d, z>(this: Sequence<(a: a, b: b, c: c, d: d) => z, any>, a: Sequence<a, any>): Sequence<(b: b, c: c, d: d) => z, [Sequence.Iterator<Sequence<z, any>>, Sequence.Iterator<z>]>;
  ap<a, b, c, d, e, z>(this: Sequence<(a: a, b: b, c: c, d: d, e: e) => z, any>, a: Sequence<a, any>): Sequence<(b: b, c: c, d: d, e: e) => z, [Sequence.Iterator<Sequence<z, any>>, Sequence.Iterator<z>]>;
  bind<b>(f: (a: a) => Sequence<b, any>): Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]>;
  mapM<b>(f: (a: a) => Sequence<b, any>): Sequence<b[], [Sequence.Iterator<Sequence<b[], any>>, Sequence.Iterator<b[]>]>;
  filterM(f: (a: a) => Sequence<boolean, any>): Sequence<a[], [Sequence.Iterator<Sequence<a[], any>>, Sequence.Iterator<a[]>]>;
  map<b>(f: (a: a, i: number) => b): Sequence<b, Sequence.Iterator<a>>;
  filter(f: (a: a, i: number) => boolean): Sequence<a, Sequence.Iterator<a>>;
  scan<b>(f: (b: b, a: a) => b, z: b): Sequence<b, [b, Sequence.Iterator<a>, number]>;
  fold<b>(f: (a: a, b: Sequence<b, any>) => Sequence<b, any>, z: Sequence<b, any>): Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]>;
  group(f: (x: a, y: a) => boolean): Sequence<a[], [Sequence.Iterator<a>, a[]]>;
  subsequences(): Sequence<a[], [Sequence.Iterator<a[]>, Sequence.Iterator<a[]>]>;
  permutations(): Sequence<a[], [Sequence.Iterator<Sequence<a[], any>>, Sequence.Iterator<a[]>]>;
  take(n: number): Sequence<a, Sequence.Iterator<a>>;
  drop(n: number): Sequence<a, Sequence.Iterator<a>>;
  takeWhile(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>>;
  dropWhile(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>>;
  takeUntil(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>>;
  dropUntil(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>>;
  memoize(memory?: Map<number, Sequence.Data<a, z>>): Sequence<a, z>;
}

export namespace Sequence {
  export type Data<a, z> = ISequence.Data<a, z>;
  export namespace Data {
    export function cons<a, z>(a?: a, z?: z): Sequence.Data<a, z> {
      switch (arguments.length) {
        case 0:
          return <Sequence.Data<a, z>><any[]>[];
        case 1:
          return <Sequence.Data<a, z>><any[]>[a];
        case 2:
          return <Sequence.Data<a, z>>[a, z];
        default:
          throw Sequence.Exception.invalidConsError(arguments);
      }
    }
  }
  export type Thunk<a> = ISequence.Thunk<a>;
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
  export type Iterator<a> = ISequence.Iterator<a>;
  export namespace Iterator {
    export let /* const */ done: Sequence.Iterator<any> = () => <Sequence.Thunk<any>>[void 0, done, -1];
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
  export function isIterable(thunk: Thunk<any>): boolean {
    return Thunk.iterator(thunk) !== Iterator.done;
  }
  export namespace Exception {
    export function invalidConsError(args: IArguments): TypeError {
      console.error(args, args.length, args[0], args[1]);
      return new TypeError(`Spica: Sequence: Invalid parameters of cons.`);
    }
    export function invalidDataError(data: Sequence.Data<any, any>): TypeError {
      console.error(data);
      return new TypeError(`Spica: Sequence: Invalid data.`);
    }
    export function invalidThunkError(thunk: Sequence.Thunk<any>): TypeError {
      console.error(thunk);
      return new TypeError(`Spica: Sequence: Invalid thunk.`);
    }
  }
}

function throwCallError(): never {
  throw new Error(`Spica: Sequence: Invalid thunk call.`);
}
