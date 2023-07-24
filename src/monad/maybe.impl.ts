import { MonadPlus } from './monadplus';
import { AtomicPromise } from '../promise';
import { noop } from '../function';
import { push } from '../array';

export class Maybe<a> extends MonadPlus<a> {
  constructor(thunk: () => Maybe<a>) {
    super(thunk);
  }
  public fmap<b>(f: (a: a) => b): Maybe<b> {
    return this.bind(a => new Just(f(a)));
  }
  public ap<a, z>(this: Maybe<(a: a) => z>, a: Maybe<a>): Maybe<z>;
  public ap<a, b, z>(this: Maybe<(a: a, b: b) => z>, a: Maybe<a>): Maybe<(b: b) => z>;
  public ap<a, b, c, z>(this: Maybe<(a: a, b: b, c: c) => z>, a: Maybe<a>): Maybe<(b: b, c: c) => z>;
  public ap<a, b, c, d, z>(this: Maybe<(a: a, b: b, c: c, d: d) => z>, a: Maybe<a>): Maybe<(b: b, c: c, d: d) => z>;
  public ap<a, b, c, d, e, z>(this: Maybe<(a: a, b: b, c: c, d: d, e: e) => z>, a: Maybe<a>): Maybe<(b: b, c: c, d: d, e: e) => z>;
  public ap<a, z>(this: Maybe<(...as: any[]) => z>, a: Maybe<a>): Maybe<z> {
    return Maybe.ap(this, a);
  }
  public bind<b>(f: (a: a) => Maybe<b>): Maybe<b> {
    return new Maybe<b>(() => {
      const m: Maybe<a> = this.evaluate();
      switch (m.constructor) {
        case Just:
          return f(m.extract());
        case Nothing:
          return m as Nothing;
        default:
          return m.bind(f);
      }
    });
  }
  public join<b>(this: Maybe<Maybe<b>>): Maybe<b> {
    return this.bind(m => m);
  }
  public guard(cond: boolean): Maybe<a> {
    return cond ? this : Maybe.mzero;
  }
  public extract(): a;
  public extract<b>(nothing: () => b): a | b;
  public extract<b>(nothing: () => b, just: (a: a) => b): b;
  public extract<b>(nothing?: () => b, just?: (a: a) => b): a | b {
    return just === undefined
      ? this.evaluate().extract(nothing!)
      : this.fmap(just).extract(nothing!);
  }
  public static do<a>(block: () => Iterator<Maybe<a>, Maybe<a>, a>): Maybe<a> {
    const iter = block();
    let value: a | undefined;
    while (true) {
      const { value: m, done } = iter.next(value!);
      if (done) return m;
      if (m.extract(noop, a => [value = a]) === undefined) return m;
    }
  }
}
export namespace Maybe {
  export declare function fmap<a, b>(f: (a: a) => b, m: Maybe<a>): Maybe<b>;
  export function pure<a>(a: a): Maybe<a> {
    return new Just(a);
  }
  export declare function ap<a, b>(mf: Maybe<(a: a) => b>, ma: Maybe<a>): Maybe<b>;
  export declare function ap<a, b>(mf: Maybe<(a: a) => b>): (ma: Maybe<a>) => Maybe<b>;
  export const Return = pure;
  export declare function bind<a, b>(f: (a: a) => Maybe<b>, m: Maybe<a>): Maybe<b>;
  export function sequence<a>(fm: Maybe<a>[]): Maybe<a[]>;
  export function sequence<a>(fm: Maybe<PromiseLike<a>>): AtomicPromise<Maybe<a>>;
  export function sequence<a>(fm: Maybe<a>[] | Maybe<PromiseLike<a>>): Maybe<a[]> | AtomicPromise<Maybe<a>> {
    return fm instanceof Maybe
      ? fm.extract(() => AtomicPromise.resolve(mzero), a => AtomicPromise.resolve(a).then(Return))
      : fm.reduce((acc, m) => acc.bind(as => m.fmap(a => push(as, [a]))), Return([]));
  }
}

export class Just<a> extends Maybe<a> {
  constructor(private readonly value: a) {
    super(throwCallError);
  }
  public override bind<b>(f: (a: a) => Just<b>): Just<b>;
  public override bind<b>(f: (a: a) => Nothing): Nothing;
  public override bind<b>(f: (a: a) => Maybe<b>): Maybe<b>;
  public override bind<b>(f: (a: a) => Maybe<b>): Maybe<b> {
    return new Maybe(() => f(this.extract()));
  }
  public override extract(): a;
  public override extract<b>(nothing: () => b): a;
  public override extract<b>(nothing: () => b, just: (a: a) => b): b;
  public override extract<b>(nothing?: () => b, just?: (a: a) => b): a | b {
    if (just !== undefined) return just(this.value);
    return this.value;
    assert([nothing]);
  }
}

export class Nothing extends Maybe<never> {
  constructor() {
    super(throwCallError);
  }
  public override bind<b>(f: (a: never) => Maybe<b>): Nothing {
    return this;
    assert(f);
  }
  public override extract(): never;
  public override extract<b>(nothing: () => b): b;
  public override extract<b>(nothing: () => b, just: (a: never) => b): b;
  public override extract<b>(nothing?: () => b): b {
    if (nothing !== undefined) return nothing();
    throw new Error(`Spica: Maybe: Nothing value is extracted.`);
  }
}

export namespace Maybe {
  export const mzero = new Nothing();
  export function mplus<a>(ml: Maybe<a>, mr: Maybe<a>): Maybe<a> {
    return new Maybe<a>(() =>
      ml.extract(() => mr, () => ml));
  }
}

function throwCallError(): never {
  throw new Error(`Spica: Maybe: Invalid thunk call.`);
}
