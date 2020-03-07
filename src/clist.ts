import { undefined } from './global';

type Cont<T> = (() => Result<T>) | undefined;
type Result<T> = [T, Cont<T>];
function Cont<T>(value: T, cont: Cont<T>): NonNullable<Cont<T>> {
  const r = Result(value, cont);
  return () => r;
}
function Result<T>(value: T, cont: Cont<T>): Result<T> {
  return [value, cont];
}

export type CList<T> = CCons<T>;
export function CList<T>(...values: T[]): CCons<T> {
  let cont: Cont<T>;
  //for (let i = values.length; i--;) { slower x3-10
  for (let i = values.length - 1; i >= 0; --i) {
    cont = Cont(values[i], cont);
  }
  return new CCons(cont);
}

// Don't extend any class for performance.
class CCons<T> {
  constructor(
    public cont: Cont<T>,
  ) {
  }
  public get head(): T {
    return this.cont!()[0];
  }
  public get tail(): CCons<T> {
    return new CCons(this.cont!()[1]);
  }
  public add(value: T): CCons<T> {
    this.cont = Cont(value, this.cont);
    return this;
  }
  public foldl<U>(f: (acc: U, value: T) => U, acc: U): U {
    for (let { cont } = this; cont;) {
      acc = f(acc, [{ 1: cont } = cont()][0][0]);
    }
    return acc;
  }
  public foldr<U>(f: (value: T, acc: U) => U, acc: U): U {
    for (let { cont } = this.reverse(); cont;) {
      acc = f([{ 1: cont } = cont()][0][0], acc);
    }
    return acc;
  }
  public map<U>(f: (value: T) => U): CList<U> {
    const cont = Cont<U>(undefined as never, undefined)!;
    this.foldl<Cont<U>>((acc, value) => this.append(acc, f(value)), cont);
    return new CCons(cont()[1]);
  }
  private append<T>(cont: Cont<T>, value: T): Cont<T> {
    const t = cont!();
    assert(!t[1]);
    return t[1] = Cont(value, undefined);
  }
  public reverse(): CList<T> {
    this.cont = this.foldl<Cont<T>>((acc, value) => Cont(value, acc), undefined);
    return this;
  }
  public get length(): number {
    return this.foldl(acc => acc + 1, 0);
  }
  public *[Symbol.iterator](): IterableIterator<T> {
    for (let { cont } = this; cont;) {
      yield [{ 1: cont } = cont()][0][0];
    }
  }
}
