import {Monad} from './monad';

export class Either<a, b> extends Monad<b> {
  protected EITHER: Left<a> | Right<b>;
  constructor(thunk: () => Either<a, b>) {
    super(thunk);
  }
  public fmap<c>(f: (b: b) => c): Either<a, c> {
    return this.bind(b => new Right(f(b)));
  }
  public bind<c>(f: (b: b) => Either<a, c>): Either<a, c> {
    return new Either<a, c>(() => {
      const m: Either<a, b> = this.evaluate();
      if (m instanceof Left) {
        return m;
      }
      if (m instanceof Right) {
        return f(m.extract());
      }
      if (m instanceof Either) {
        return m.bind(f);
      }
      throw new TypeError(`Spica: Either: Invalid monad value.\n\t${m}`);
    });
  }
  public extract(): b
  public extract<c>(transform: (a: a) => c): c | b
  public extract<c>(transform?: (a: a) => c): c | b {
    return this.evaluate().extract(transform);
  }
}
export namespace Either {
  export function pure<b>(b: b): Right<b> {
    return new Right(b);
  }
  export function ap<e, a, b>(ff: Either<e, () => b>): () => Either<e, b>
  export function ap<e, a, b>(ff: Either<e, (a: a) => b>): (fa: Either<e, a>) => Either<e, b>
  export function ap<e, a, b>(ff: Either<e, (a: a) => b>): (fa: Either<e, a>) => Either<e, b> {
    return (fa: Either<e, a>) => ff.bind(f => fa.fmap(a => f(a)));
  }
  export function Return<b>(b: b): Right<b> {
    return new Right(b);
  }
}

export class Left<a> extends Either<a, any> {
  protected EITHER: Left<a>;
  constructor(private a: a) {
    super(throwCallError);
  }
  public bind<_ extends a>(f: (b: any) => Either<a, any>): Either<a, any>
  public bind<_ extends a, b>(f: (b: b) => Either<a, b>): Either<a, b>
  public bind<_ extends a, b>(f: (b: b) => Either<a, b>): Either<a, b> {
    return this;
  }
  public extract(): any
  public extract<c>(transform: (a: a) => c): c
  public extract<c>(transform?: (a: a) => c): c {
    if (!transform) throw this.a;
    return transform(this.a);
  }
}

export class Right<b> extends Either<any, b> {
  protected EITHER: Right<b>;
  constructor(private b: b) {
    super(throwCallError);
  }
  public bind<a>(f: (b: b) => Either<a, b>): Either<a, b>
  public bind<a, c>(f: (b: b) => Either<a, c>): Either<a, c>
  public bind<a, c>(f: (b: b) => Either<a, c>): Either<a, c> {
    return new Either<a, c>(() => f(this.extract()));
  }
  public extract(): b
  public extract<c>(transform: (a: c) => c): b
  public extract<c>(transform?: (a: c) => c): b {
    return this.b;
  }
}

function throwCallError<T>(): T {
  throw new Error(`Spica: Either: Invalid thunk call.`);
}
