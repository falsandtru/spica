import {Monad} from '../monad';

export class Sequence<T, S> extends Monad<T> {
  constructor(
    protected cons: (p: S, cons: (value?: T, next?: S) => Sequence.Data<T, S>) => Sequence.Data<T, S>,
    protected memory?: Map<number, Sequence.Data<T, S>>
  ) {
    super();
  }
}
export namespace Sequence {
  export declare function from<T>(as: T[]): Sequence<T, number>;
  export declare function write<T>(as: T[]): Sequence<T, T[]>;
  export declare function random(): Sequence<number, number>;
  export declare function random<T>(gen: () => T): Sequence<T, number>;
  export declare function random<T>(as: T[]): Sequence<T, Sequence.Iterator<number>>;
  export declare function concat<T>(as: Sequence<Sequence<T, any>, any>): Sequence<T, [Sequence.Iterator<Sequence<T, any>>, Sequence.Iterator<T>]>;
  export declare function zip<T, U>(a: Sequence<T, any>, b: Sequence<U, any>): Sequence<[T, U], [Sequence.Iterator<T>, Sequence.Iterator<U>]>;
  export declare function union<T>(cmp: (a: T, b: T) => number, as: Sequence<T, any>[]): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]>;
  export declare function intersect<T>(cmp: (a: T, b: T) => number, as: Sequence<T, any>[]): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]>;
  export declare function Return<T>(a: T): Sequence<T, number>;
  export declare const mempty: Sequence<any, any>;
  export declare function mappend<T>(a: Sequence<T, any>, b: Sequence<T, any>): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]>;
  export declare function mconcat<T>(as: Sequence<T, any>[]): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]>;
}
export interface Sequence<T, S> {
  iterate(): Sequence.Thunk<T>;
  read(): T[];
  fmap<U>(f: (p: T) => U): Sequence<U, Sequence.Iterator<T>>;
  bind<U>(f: (p: T) => Sequence<U, any>): Sequence<U, [Sequence.Iterator<Sequence<U, any>>, Sequence.Iterator<U>]>;
  mapM<U>(f: (p: T) => Sequence<U, any>): Sequence<U[], [Sequence.Iterator<Sequence<U[], any>>, Sequence.Iterator<U[]>]>;
  filterM(f: (p: T) => Sequence<boolean, any>): Sequence<T[], [Sequence.Iterator<Sequence<T[], any>>, Sequence.Iterator<T[]>]>;
  map<U>(f: (p: T, i: number) => U): Sequence<U, Sequence.Iterator<T>>;
  filter(f: (p: T, i: number) => boolean): Sequence<T, Sequence.Iterator<T>>;
  scan<U>(f: (b: U, a: T) => U, z: U): Sequence<U, [U, Sequence.Iterator<T>]>;
  take(n: number): Sequence<T, Sequence.Iterator<T>>;
  drop(n: number): Sequence<T, Sequence.Iterator<T>>;
  takeWhile(f: (p: T) => boolean): Sequence<T, Sequence.Iterator<T>>;
  dropWhile(f: (p: T) => boolean): Sequence<T, Sequence.Iterator<T>>;
  takeUntil(f: (p: T) => boolean): Sequence<T, Sequence.Iterator<T>>;
  dropUntil(f: (p: T) => boolean): Sequence<T, Sequence.Iterator<T>>;
  memoize(memory?: Map<number, Sequence.Data<T, S>>): Sequence<T, S>;
}

export namespace Sequence {
  export type Data<T, S> = [T, S];
  export namespace Data {
    export function cons<T, S>(value?: T, next?: S): Sequence.Data<T, S> {
      switch (arguments.length) {
        case 0:
          return <Sequence.Data<T, S>>[];
        case 1:
          return <Sequence.Data<T, S>><[]>[value];
        case 2:
          return <Sequence.Data<T, S>>[value, next];
        default:
          throw Sequence.Exception.invalidConsError(arguments);
      }
    }
  }
  export type Thunk<T> = [T, Iterator<T>, number];
  export namespace Thunk {
    export function value<T>(thunk: Thunk<T>): T {
      return thunk[0];
    }
    export function iterator<T>(thunk: Thunk<T>): Iterator<T> {
      return thunk[1];
    }
    export function index<T>(thunk: Thunk<T>): number {
      return thunk[2];
    }
  }
  export type Iterator<T> = () => Thunk<T>;
  export namespace Iterator {
    export const done: Sequence.Iterator<any> = () => <Sequence.Thunk<any>>[void 0, done, -1];
    export function when<T, U>(
      thunk: Thunk<T>,
      caseDone: (thunk: Thunk<T>) => U,
      caseIterable: (thunk: Thunk<T>, recur: () => U) => U
    ): U {
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
