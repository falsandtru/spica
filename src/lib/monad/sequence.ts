//import {Sequence as ISequence} from 'spica';
import {Monad} from './monad';
import {concat} from '../concat';

function cons<T, S>(value?: T, next?: S): Sequence.Data<T, S> {
  switch (arguments.length) {
    case 0:
      return <Sequence.Data<T, S>>[];
    case 1:
      return <Sequence.Data<T, S>><[]>[value];
    case 2:
      return <Sequence.Data<T, S>>[value, next];
    default:
      throw invalidConsError(arguments);
  }
}

export class Sequence<T, S> extends Monad<T> /*implements ISequence<T, S>*/ {
  public static from<T>(as: T[]): Sequence<T, number> {
    return new Sequence<T, number>((i = 0, cons) => i < as.length ? cons(as[i], ++i) : cons());
  }
  public static write<T>(as: T[]): Sequence<T, T[]> {
    return new Sequence<T, T[]>((_, cons) => as.length > 0 ? cons(as.shift(), as) : cons());
  }
  public static random(): Sequence<number, number>
  public static random<T>(gen: () => T): Sequence<T, number>
  public static random<T>(as: T[]): Sequence<T, Sequence.Iterator<number>>
  public static random<T>(p: (() => number) | (() => T) | T[] = () => Math.random()): Sequence<number, number> | Sequence<T, number> | Sequence<T, Sequence.Iterator<number>> {
    switch (true) {
      case Array.isArray(p): 
        return Sequence.random()
          .map(r => p[r * p.length | 0]);
      default:
        return new Sequence<T, number>((_, cons) => cons((<() => T>p)(), NaN));
    }
  }
  public static zip<T, U>(a: Sequence<T, any>, b: Sequence<U, any>): Sequence<[T, U], [Sequence.Iterator<T>, Sequence.Iterator<U>]> {
    return new Sequence<[T, U], [Sequence.Iterator<T>, Sequence.Iterator<U>]>(([ai, bi] = [() => a.iterate(), () => b.iterate()], cons) =>
      Sequence.Iterator.when(
        ai(),
        () => cons(),
        at =>
          Sequence.Iterator.when(
            bi(),
            () => cons(),
            bt => cons([Sequence.Thunk.value(at), Sequence.Thunk.value(bt)], [Sequence.Thunk.iterator(at), Sequence.Thunk.iterator(bt)]))));
  }
  public static union<T>(cmp: (a: T, b: T) => number, ss: Sequence<T, any>[]): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]> {
    return ss.reduce((a, b) => union(cmp, a, b));

    function union<T>(cmp: (a: T, b: T) => number, a: Sequence<T, any>, b: Sequence<T, any>): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]> {
      return new Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]>(([ai, bi] = [() => a.iterate(), () => b.iterate()], cons) =>
        Sequence.Iterator.when(
          ai(),
          () =>
            Sequence.Iterator.when(
              bi(),
              () => cons(),
              bt => cons(Sequence.Thunk.value(bt), [Sequence.Iterator.done, Sequence.Thunk.iterator(bt)])),
          at =>
            Sequence.Iterator.when(
              bi(),
              () => cons(Sequence.Thunk.value(at), [Sequence.Thunk.iterator(at), Sequence.Iterator.done]),
              bt => {
                const result = cmp(Sequence.Thunk.value(at), Sequence.Thunk.value(bt));
                if (result < 0) return cons(Sequence.Thunk.value(at), [Sequence.Thunk.iterator(at), () => bt]);
                if (result > 0) return cons(Sequence.Thunk.value(bt), [() => at, Sequence.Thunk.iterator(bt)]);
                return cons(Sequence.Thunk.value(at), [Sequence.Thunk.iterator(at), Sequence.Thunk.iterator(bt)]);
              })));
    }
  }
  public static intersect<T>(cmp: (a: T, b: T) => number, ss: Sequence<T, any>[]): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]> {
    return ss.reduce((a, b) => intersect(cmp, a, b));

    function intersect<T>(cmp: (a: T, b: T) => number, a: Sequence<T, any>, b: Sequence<T, any>): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]> {
      return new Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]>(([ai, bi] = [() => a.iterate(), () => b.iterate()], cons) =>
        Sequence.Iterator.when(
          ai(),
          () => cons(),
          (at, ar) =>
            Sequence.Iterator.when(
              bi(),
              () => cons(),
              (bt, br) => {
                const result = cmp(Sequence.Thunk.value(at), Sequence.Thunk.value(bt));
                if (result < 0) return bi = () => bt, ar();
                if (result > 0) return br();
                return cons(Sequence.Thunk.value(at), [Sequence.Thunk.iterator(at), Sequence.Thunk.iterator(bt)]);
              })));
    }
  }
  constructor(
    private cons: (p: S, cons: (value?: T, next?: S) => Sequence.Data<T, S>) => Sequence.Data<T, S>,
    private memory?: Map<number, Sequence.Data<T, S>>
  ) {
    super();
    void Object.freeze(this);
  }
  public iterate(): Sequence.Thunk<T> {
    return this.iterate_();
  }
  private iterate_(p?: S, i = 0): Sequence.Thunk<T> {
    const data = this.memory
      ? this.memory.has(i)
        ? this.memory.get(i)
        : this.memory.set(i, this.cons(p, cons)).get(i)
      : this.cons(p, cons);
    switch (data.length) {
      case 0:
        return <Sequence.Thunk<T>>[
          void 0,
          Sequence.Iterator.done,
          -1
        ];
      case 1:
        return <Sequence.Thunk<T>>[
          data[0],
          () => Sequence.Iterator.done(),
          i
        ];
      case 2:
        return <Sequence.Thunk<T>>[
          data[0],
          () => this.iterate_(data[1], i + 1),
          i
        ];
      default:
        throw invalidDataError(data);
    }
  }
  public memoize(map: Map<number, Sequence.Data<T, S>> = this.memory || new Map<number, Sequence.Data<T, S>>()): Sequence<T, S> {
    return new Sequence<T, S>(this.cons, this.memory || map);
  }
  public read(): T[] {
    const acc: T[] = [];
    let iter = () => this.iterate();
    while (true) {
      const thunk = iter();
      if (!Sequence.isIterable(thunk)) return acc;
      void concat(acc, [Sequence.Thunk.value(thunk)]);
      iter = Sequence.Thunk.iterator(thunk);
    }
  }
  public fmap<U>(f: (p: T) => U): Sequence<U, Sequence.Iterator<T>> {
    return new Sequence<U, Sequence.Iterator<T>>((iter = () => this.iterate()) =>
      Sequence.Iterator.when(
        iter(),
        () => cons<U, Sequence.Iterator<T>>(),
        thunk => cons<U, Sequence.Iterator<T>>(f(Sequence.Thunk.value(thunk)), Sequence.Thunk.iterator(thunk))));
  }
  public bind<U>(f: (p: T) => Sequence<U, any>): Sequence<U, [Sequence.Iterator<T>, Sequence.Iterator<U>]> {
    return new Sequence<U, [Sequence.Iterator<T>, Sequence.Iterator<U>]>(([ai, bi] = [() => this.iterate(), Sequence.Iterator.done], cons) =>
      Sequence.Iterator.when(
        ai(),
        () => cons(),
        (at, recur) => {
          bi = bi === Sequence.Iterator.done
            ? () => f(Sequence.Thunk.value(at)).iterate()
            : bi;
          return Sequence.Iterator.when(
            bi(),
            () => (bi = Sequence.Iterator.done, recur()),
            bt => cons(Sequence.Thunk.value(bt), [() => at, Sequence.Thunk.iterator(bt)]));
        }));
  }
  public filterM(f: (p: T) => Sequence<boolean, any>): Sequence<T[], [Sequence.Iterator<T>, Sequence.Iterator<T[]>]> {
    return this
      .take(1)
      .bind(() => {
        const xs = this.read();
        switch (xs.length) {
          case 0:
            return Sequence.from<T[]>([[]]);
          default: {
            const x = xs.shift();
            return f(x)
              .bind(b =>
                b
                  ? xs.length === 0
                    ? Sequence.from<T[]>([[x]])
                    : Sequence.from(xs).filterM(f).fmap(ys => concat([x], ys))
                  : xs.length === 0
                    ? Sequence.from<T[]>([[]])
                    : Sequence.from(xs).filterM(f));
          }
        }
      });
  }
  public mapM<U>(f: (p: T) => Sequence<U, any>): Sequence<U[], [Sequence.Iterator<T>, Sequence.Iterator<U[]>]> {
    return this
      .take(1)
      .bind(() => {
        const xs = this.read();
        switch (xs.length) {
          case 0:
            return Sequence.from<U[]>([]);
          default: {
            const x = xs.shift();
            return f(x)
              .bind(y =>
                xs.length === 0
                  ? Sequence.from<U[]>([[y]])
                  : Sequence.from(xs).mapM(f).fmap(ys => concat([y], ys)));
          }
        }
      });
  }
  public map<U>(f: (p: T, i: number) => U): Sequence<U, Sequence.Iterator<T>> {
    return new Sequence<U, Sequence.Iterator<T>>((iter = () => this.iterate()) =>
      Sequence.Iterator.when(
        iter(),
        () => cons<U, Sequence.Iterator<T>>(),
        thunk => cons<U, Sequence.Iterator<T>>(f(Sequence.Thunk.value(thunk), Sequence.Thunk.index(thunk)), Sequence.Thunk.iterator(thunk))));
  }
  public scan<U>(f: (b: U, a: T) => U, z: U): Sequence<U, [U, Sequence.Iterator<T>]> {
    return new Sequence<U, [U, Sequence.Iterator<T>]>(([prev = z, iter = () => this.iterate()] = [void 0, void 0]) =>
      Sequence.Iterator.when(
        iter(),
        () => cons<U, [U, Sequence.Iterator<T>]>(),
        thunk =>
          cons<U, [U, Sequence.Iterator<T>]>(
            prev = f(prev, Sequence.Thunk.value(thunk)),
            [prev, Sequence.Thunk.iterator(thunk)])));
  }
  public until(f: (p: T) => boolean): Sequence<T, Sequence.Iterator<T>> {
    return new Sequence<T, Sequence.Iterator<T>>((iter = () => this.iterate(), cons) =>
      Sequence.Iterator.when(
        iter(),
        () => cons(),
        thunk =>
          f(Sequence.Thunk.value(thunk))
            ? cons(Sequence.Thunk.value(thunk))
            : cons(Sequence.Thunk.value(thunk), Sequence.Thunk.iterator(thunk))));
  }
  public take(n: number): Sequence<T, Sequence.Iterator<T>> {
    return this.takeWhile((_, i) => i < n);
  }
  public drop(n: number): Sequence<T, Sequence.Iterator<T>> {
    return this.dropWhile((_, i) => i < n);
  }
  public takeWhile(f: (p: T, i: number) => boolean): Sequence<T, Sequence.Iterator<T>> {
    return new Sequence<T, Sequence.Iterator<T>>((iter = () => this.iterate(), cons) =>
      Sequence.Iterator.when(
        iter(),
        () => cons(),
        thunk =>
          f(Sequence.Thunk.value(thunk), Sequence.Thunk.index(thunk))
            ? cons(Sequence.Thunk.value(thunk), Sequence.Thunk.iterator(thunk))
            : cons()));
  }
  public dropWhile(f: (p: T, i: number) => boolean): Sequence<T, Sequence.Iterator<T>> {
    return new Sequence<T, Sequence.Iterator<T>>((iter = () => this.iterate(), cons) =>
      Sequence.Iterator.when(
        iter(),
        () => cons(),
        (thunk, recur) =>
          f(Sequence.Thunk.value(thunk), Sequence.Thunk.index(thunk))
            ? recur()
            : cons(Sequence.Thunk.value(thunk), Sequence.Thunk.iterator(thunk))));
  }
  public filter(f: (p: T, i: number) => boolean): Sequence<T, Sequence.Iterator<T>> {
    return new Sequence<T, Sequence.Iterator<T>>((iter = () => this.iterate(), cons) =>
      Sequence.Iterator.when(
        iter(),
        () => cons(),
        (thunk, recur) =>
          f(Sequence.Thunk.value(thunk), Sequence.Thunk.index(thunk))
            ? cons(Sequence.Thunk.value(thunk), Sequence.Thunk.iterator(thunk))
            : recur()));
  }
}
export namespace Sequence {
  export type Data<T, S> = [T, S];
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
}

function invalidConsError(args: IArguments): TypeError {
  console.error(args, args.length, args[0], args[1]);
  return new TypeError(`Spica: Sequence: Invalid parameters of cons.`);
}
function invalidDataError(data: Sequence.Data<any, any>): TypeError {
  console.error(data);
  return new TypeError(`Spica: Sequence: Invalid data.`);
}
function invalidThunkError(thunk: Sequence.Thunk<any>): TypeError {
  console.error(thunk);
  return new TypeError(`Spica: Sequence: Invalid thunk.`);
}
