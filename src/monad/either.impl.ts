import { Monad } from './monad';
import { AtomicPromise } from '../promise';
import { noop } from '../function';
import { push } from '../array';

export class Either<a, b> extends Monad<b> {
  constructor(thunk: () => Either<a, b>) {
    super(thunk);
  }
  public fmap<c>(f: (b: b) => c): Either<a, c> {
    return this.bind(b => new Right(f(b)));
  }
  public ap<b, z>(this: Either<a, (b: b) => z>, b: Either<a, b>): Either<a, z>;
  public ap<b, c, z>(this: Either<a, (b: b, c: c) => z>, b: Either<a, b>): Either<a, (c: c) => z>;
  public ap<b, c, d, z>(this: Either<a, (b: b, c: c, d: d) => z>, b: Either<a, b>): Either<a, (c: c, d: d) => z>;
  public ap<b, c, d, e, z>(this: Either<a, (b: b, c: c, d: d, e: e) => z>, b: Either<a, b>): Either<a, (c: c, d: d, e: e) => z>;
  public ap<b, c, d, e, f, z>(this: Either<a, (b: b, c: c, d: d, e: e, f: f) => z>, b: Either<a, b>): Either<a, (c: c, d: d, e: e, f: f) => z>;
  public ap<b, z>(this: Either<a, (b: b) => z>, b: Either<a, b>): Either<a, z> {
    return Either.ap(this, b);
  }
  public bind<c>(f: (b: b) => Either<a, c>): Either<a, c> {
    return new Either<a, c>(() => {
      const m: Either<a, b> = this.evaluate();
      switch (m.constructor) {
        case Right:
          return f(m.extract());
        case Left:
          return m as Left<a>;
        default:
          return m.bind(f);
      }
    });
  }
  public join<c>(this: Either<a, Either<a, c>>): Either<a, c> {
    return this.bind(m => m);
  }
  public extract(): b;
  public extract<c>(left: (a: a) => c): b | c;
  public extract<c>(left: (a: a) => c, right: (b: b) => c): c;
  public extract<c>(left?: (a: a) => c, right?: (b: b) => c): b | c {
    return right === undefined
      ? this.evaluate().extract(left!)
      : this.fmap(right).extract(left!);
  }
  public static do<b>(block: () => Iterator<Either<never, b>, Either<never, b>, b>): Either<never, b>;
  public static do<a, b>(block: () => Iterator<Either<a, b>, Either<a, b>, b>): Either<a, b>;
  public static do<a, b>(block: () => Iterator<Either<a, b>, Either<a, b>, b>): Either<a, b> {
    const iter = block();
    let value: b | undefined;
    while (true) {
      const { value: m, done } = iter.next(value!);
      if (done) return m;
      if (m.extract(noop, a => [value = a]) === undefined) return m;
    }
  }
}
export namespace Either {
  export declare function fmap<a, b, c>(m: Either<a, b>, f: (b: b) => c): Either<a, c>;
  export declare function fmap<a, b>(m: Either<a, b>): <c>(f: (b: b) => c) => Either<a, c>;
  export function pure<b>(b: b): Right<b>;
  export function pure<a, b>(b: b): Either<a, b>;
  export function pure<a, b>(b: b): Either<a, b> {
    return new Right(b);
  }
  export declare function ap<a, b, c>(mf: Either<a, (b: b) => c>, ma: Either<a, b>): Either<a, c>;
  export declare function ap<a, b, c>(mf: Either<a, (b: b) => c>): (ma: Either<a, b>) => Either<a, c>;
  export const Return = pure;
  export declare function bind<a, b, c>(m: Either<a, b>, f: (b: b) => Either<a, c>): Either<a, c>;
  export declare function bind<a, b>(m: Either<a, b>): <c>(f: (b: b) => Either<a, c>) => Either<a, c>;
  export function sequence<a, b>(fm: Either<a, b>[]): Either<a, b[]>;
  export function sequence<a, b>(fm: Either<a, PromiseLike<b>>): AtomicPromise<Either<a, b>>;
  export function sequence<a, b>(fm: Either<a, b>[] | Either<a, PromiseLike<b>>): Either<a, b[]> | AtomicPromise<Either<a, b>> {
    return fm instanceof Either
      ? fm.extract(b => AtomicPromise.resolve(new Left(b)), a => AtomicPromise.resolve(a).then<Either<a, b>>(Return))
      : fm.reduce((acc, m) => acc.bind(as => m.fmap(a => push(as, [a]))), Return([]));
  }
}

export class Left<a> extends Either<a, never> {
  constructor(private value: a) {
    super(throwCallError);
  }
  public override bind<c>(f: (b: never) => Either<a, c>): Left<a> {
    return this;
    assert(f);
  }
  public override extract(): never;
  public override extract<c>(left: (a: a) => c): c;
  public override extract<c>(left: (a: a) => c, right: (b: never) => c): c;
  public override extract<c>(left?: (a: a) => c): c {
    if (left !== undefined) return left(this.value);
    throw this.value;
  }
}

export class Right<b> extends Either<never, b> {
  constructor(private readonly value: b) {
    super(throwCallError);
  }
  public override bind<c, a = never>(f: (b: b) => Right<c>): Right<c>;
  public override bind<c, a = never>(f: (b: b) => Left<a>): Left<a>;
  public override bind<c, a>(f: (b: b) => Either<a, c>): Either<a, c>;
  public override bind<c, a>(f: (b: b) => Either<a, c>): Either<a, c> {
    return new Either(() => f(this.extract()));
  }
  public override extract(): b;
  public override extract<c>(left: (a: never) => c): b;
  public override extract<c>(left: (a: never) => c, right: (b: b) => c): c;
  public override extract<c>(left?: (a: never) => c, right?: (b: b) => c): b | c {
    if (right !== undefined) return right(this.value);
    return this.value;
    assert([left]);
  }
}

function throwCallError(): never {
  throw new Error(`Spica: Either: Invalid thunk call.`);
}
