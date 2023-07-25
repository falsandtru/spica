import { AtomicPromise } from './promise';
import { curry } from './curry';
import { push } from './array';

export interface Either<a, b> {
  fmap<c>(f: (b: b) => c): Either<a, c>;
  ap<b, z>(this: Either<a, (b: b) => z>, b: Either<a, b>): Either<a, z>;
  ap<b, c, z>(this: Either<a, (b: b, c: c) => z>, b: Either<a, b>): Either<a, (c: c) => z>;
  ap<b, c, d, z>(this: Either<a, (b: b, c: c, d: d) => z>, b: Either<a, b>): Either<a, (c: c, d: d) => z>;
  ap<b, c, d, e, z>(this: Either<a, (b: b, c: c, d: d, e: e) => z>, b: Either<a, b>): Either<a, (c: c, d: d, e: e) => z>;
  ap<b, c, d, e, f, z>(this: Either<a, (b: b, c: c, d: d, e: e, f: f) => z>, b: Either<a, b>): Either<a, (c: c, d: d, e: e, f: f) => z>;
  bind<c>(f: (b: b) => Either<a, c>): Either<a, c>;
  join<c>(this: Either<a, Either<a, c>>): Either<a, c>;
  extract(): b;
  extract(left: (a: a) => b): b;
  extract<c>(left: (a: a) => c): b | c;
  extract<c>(left: (a: a) => c, right: (b: b) => c): c;
  extract<c, d>(left: (a: a) => c, right: (b: b) => d): c | d;
}

class Right<b> implements Either<never, b> {
  constructor(
    private readonly value: b,
  ) {
  }
  public fmap<c>(f: (b: b) => c): Right<c> {
    return new Right(f(this.value));
  }
  public ap<b, z>(this: Either<never, (b: b) => z>, b: Either<never, b>): Either<never, z>;
  public ap<b, c, z>(this: Either<never, (b: b, c: c) => z>, b: Either<never, b>): Either<never, (c: c) => z>;
  public ap<b, c, d, z>(this: Either<never, (b: b, c: c, d: d) => z>, b: Either<never, b>): Either<never, (c: c, d: d) => z>;
  public ap<b, c, d, e, z>(this: Either<never, (b: b, c: c, d: d, e: e) => z>, b: Either<never, b>): Either<never, (c: c, d: d, e: e) => z>;
  public ap<b, c, d, e, f, z>(this: Either<never, (b: b, c: c, d: d, e: e, f: f) => z>, b: Either<never, b>): Either<never, (c: c, d: d, e: e, f: f) => z>;
  public ap<b, z>(this: Either<never, (b: b) => z>, b: Either<never, b>): Either<never, z> {
    return Either.ap(this, b);
  }
  public bind<c, a = never>(f: (b: b) => Left<a>): Left<a>;
  public bind<c, a = never>(f: (b: b) => Right<c>): Right<c>;
  public bind<c, a>(f: (b: b) => Either<a, c>): Either<a, c>;
  public bind<c, a>(f: (b: b) => Either<a, c>): Either<a, c> {
    return f(this.extract());
  }
  public join<c>(this: Right<Either<never, c>>): Either<never, c> {
    return this.value;
  }
  public extract(): b;
  public extract(left: (a: never) => b): b;
  public extract<c>(left: (a: never) => c): b;
  public extract<c>(left: (a: never) => c, right: (b: b) => c): c;
  public extract<c, d>(left: (a: never) => c, right: (b: b) => d): d;
  public extract<c>(left?: (a: never) => c, right?: (b: b) => c): b | c {
    if (right !== undefined) return right(this.value);
    return this.value;
    assert([left]);
  }
}

class Left<a> implements Either<a, never> {
  constructor(
    private readonly value: a,
  ) {
  }
  public fmap<c>(f: (b: never) => c): Left<a> {
    return this;
    assert(f);
  }
  public ap<b, z>(this: Either<a, (b: b) => z>, b: Either<a, b>): Either<a, z>;
  public ap<b, c, z>(this: Either<a, (b: b, c: c) => z>, b: Either<a, b>): Either<a, (c: c) => z>;
  public ap<b, c, d, z>(this: Either<a, (b: b, c: c, d: d) => z>, b: Either<a, b>): Either<a, (c: c, d: d) => z>;
  public ap<b, c, d, e, z>(this: Either<a, (b: b, c: c, d: d, e: e) => z>, b: Either<a, b>): Either<a, (c: c, d: d, e: e) => z>;
  public ap<b, c, d, e, f, z>(this: Either<a, (b: b, c: c, d: d, e: e, f: f) => z>, b: Either<a, b>): Either<a, (c: c, d: d, e: e, f: f) => z>;
  public ap<b, z>(this: Either<a, (b: b) => z>, _: Either<a, b>): Either<a, z> {
    return this as Left<a>;
  }
  public bind<c, _ = a>(f: (b: never) => Either<a, c>): Left<a> {
    return this;
    assert(f);
  }
  public join<c>(this: Either<a, Either<a, c>>): Left<a> {
    return this as Left<a>;
  }
  public extract(): never;
  public extract<c>(left: (a: a) => c): c;
  public extract<c>(left: (a: a) => c, right: (b: never) => c): c;
  public extract<c, d>(left: (a: a) => c, right: (b: never) => d): c;
  public extract<c>(left?: (a: a) => c): c {
    if (left !== undefined) return left(this.value);
    throw this.value;
  }
}

type right<b> = Right<b>;
function right<b>(b: b): Right<b>;
function right<a, b>(b: b): Either<a, b>;
function right<a, b>(b: b): Either<a, b> {
  return new Right(b);
}
type left<a> = Left<a>;
function left<a>(value: a): Left<a> {
  return new Left(value);
}

export {
  right as Right,
  left as Left,
};

export namespace Either {
  export function fmap<a, b, c>(f: (b: b) => c, m: Either<a, b>): Either<a, c> {
    return m.fmap(f);
  }
  export const pure = right;
  export function ap<a, b, c>(mf: Either<a, (b: b) => c>, ma: Either<a, b>): Either<a, c>;
  export function ap<a, b, c>(mf: Either<a, (b: b) => c>): (ma: Either<a, b>) => Either<a, c>;
  export function ap<a, b, c>(af: Either<a, (b: b) => c>, aa?: Either<a, b>): Either<a, c> | ((aa: Either<a, b>) => Either<a, c>) {
    return aa
      ? af.bind(f => aa.fmap(curry(f)))
      : (aa: Either<a, b>) => ap(af, aa);
  }
  export const Return = pure;
  export function bind<a, b, c>(f: (b: b) => Either<a, c>, m: Either<a, b>): Either<a, c> {
    return m.bind(f);
  }
  export function sequence<a, b>(fm: Either<a, b>[]): Either<a, b[]>;
  export function sequence<a, b>(fm: Either<a, PromiseLike<b>>): AtomicPromise<Either<a, b>>;
  export function sequence<a, b>(fm: Either<a, b>[] | Either<a, PromiseLike<b>>): Either<a, b[]> | AtomicPromise<Either<a, b>> {
    return Array.isArray(fm)
      ? fm.reduce((acc, m) => acc.bind(as => m.fmap(a => push(as, [a]))), Return([]))
      : fm.extract(b => AtomicPromise.resolve(new Left(b)), a => AtomicPromise.resolve(a).then<Either<a, b>>(Return));
  }
}
