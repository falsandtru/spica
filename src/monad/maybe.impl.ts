import { MonadPlus } from './monadplus';
import { AtomicPromise } from '../promise';
import { noop } from '../function';

export class Maybe<a> extends MonadPlus<a> {
  constructor(thunk: () => Maybe<a>) {
    super(thunk);
  }
  public fmap<b>(f: (a: a) => b): Maybe<b> {
    return this.bind(a => new Just(f(a)));
  }
  public ap<a, z>(this: Maybe<(a: a) => z>, a: Maybe<a>): Maybe<z>
  public ap<a, b, z>(this: Maybe<(a: a, b: b) => z>, a: Maybe<a>): Maybe<(b: b) => z>
  public ap<a, b, c, z>(this: Maybe<(a: a, b: b, c: c) => z>, a: Maybe<a>): Maybe<(b: b, c: c) => z>
  public ap<a, b, c, d, z>(this: Maybe<(a: a, b: b, c: c, d: d) => z>, a: Maybe<a>): Maybe<(b: b, c: c, d: d) => z>
  public ap<a, b, c, d, e, z>(this: Maybe<(a: a, b: b, c: c, d: d, e: e) => z>, a: Maybe<a>): Maybe<(b: b, c: c, d: d, e: e) => z>
  public ap<a, z>(this: Maybe<(...as: any[]) => z>, a: Maybe<a>): Maybe<z> {
    return Maybe.ap(this, a);
  }
  public bind<b>(f: (a: a) => Maybe<b>): Maybe<b> {
    return new Maybe<b>(() => {
      const m: Maybe<a> = this.evaluate();
      if (m instanceof Just) {
        return f(m.extract());
      }
      if (m instanceof Nothing) {
        return m;
      }
      if (m instanceof Maybe) {
        return m.bind(f);
      }
      throw new TypeError(`Spica: Maybe: Invalid monad value: ${m}`);
    });
  }
  public guard(cond: boolean): Maybe<a> {
    return cond
      ? this
      : Maybe.mzero;
  }
  public join<b>(this: Maybe<Maybe<b>>): Maybe<b> {
    return this.bind(m => m);
  }
  public extract(): a
  public extract(nothing: () => a): a
  public extract<b>(nothing: () => b): a | b
  public extract<b>(nothing: () => b, just: (a: a) => b): b
  public extract<b>(nothing?: () => b, just?: (a: a) => b): a | b {
    return !just
      ? this.evaluate().extract(nothing!)
      : this.fmap(just).extract(nothing!);
  }
  public static do<a>(block: () => Iterator<Maybe<a>, Maybe<a>, a>): Maybe<a> {
    const iter = block();
    let val: a | undefined;
    while (true) {
      const { value: m, done } = iter.next(val!);
      if (done) return m;
      const r = m.extract(
        noop,
        a => [a]);
      if (!r) return m;
      val = r[0];
    }
  }
}
export namespace Maybe {
  export declare function fmap<a, b>(m: Maybe<a>, f: (a: a) => b): Maybe<b>
  export declare function fmap<a>(m: Maybe<a>): <b>(f: (a: a) => b) => Maybe<b>
  export function pure<a>(a: a): Maybe<a> {
    return new Just(a);
  }
  export declare function ap<a, b>(mf: Maybe<(a: a) => b>, ma: Maybe<a>): Maybe<b>
  export declare function ap<a, b>(mf: Maybe<(a: a) => b>): (ma: Maybe<a>) => Maybe<b>
  export const Return = pure;
  export declare function bind<a>(m: Maybe<a>, f: (a: a) => Maybe<a>): Maybe<a>
  export declare function bind<a, b>(m: Maybe<a>, f: (a: a) => Maybe<b>): Maybe<b>
  export declare function bind<a>(m: Maybe<a>): {
    (f: (a: a) => Nothing): Maybe<a>;
    <b>(f: (a: a) => Maybe<b>): Maybe<b>;
  };
  export function sequence<a>(fm: Maybe<a>[]): Maybe<a[]>;
  export function sequence<a>(fm: Maybe<PromiseLike<a>>): AtomicPromise<Maybe<a>>;
  export function sequence<a>(fm: Maybe<a>[] | Maybe<PromiseLike<a>>): Maybe<a[]> | AtomicPromise<Maybe<a>> {
    return fm instanceof Maybe
      ? fm.extract(() => AtomicPromise.resolve(Maybe.mzero), a => AtomicPromise.resolve(a).then(Return))
      : fm.reduce((acc, m) =>
          acc.bind(as =>
            m.fmap(a =>
              [...as, a]))
        , Return<a[]>([]));
  }
}

export class Just<a> extends Maybe<a> {
  constructor(private readonly value: a) {
    super(throwCallError);
  }
  public override bind<b>(f: (a: a) => Maybe<b>): Maybe<b> {
    return new Maybe(() => f(this.extract()));
  }
  public override extract(): a
  public override extract(transform: () => a): a
  public override extract<b>(transform: () => b): a
  public override extract<b>(nothing: () => b, just: (a: a) => b): b
  public override extract<b>(_?: () => b, just?: (a: a) => b): a | b {
    return !just
      ? this.value
      : just(this.value);
  }
}

export class Nothing extends Maybe<never> {
  constructor() {
    super(throwCallError);
  }
  public override bind<_>(_: (_: never) => Nothing): Nothing
  public override bind<a>(_: (_: never) => Maybe<a>): Maybe<a>
  public override bind<a>(_: (_: never) => Maybe<a>): Maybe<a> {
    return this;
  }
  public override extract(): never
  public override extract<b>(transform: () => b): b
  public override extract<b>(nothing: () => b, just: (a: never) => b): b
  public override extract<b>(nothing?: () => b): b {
    if (!nothing) throw new Error(`Spica: Maybe: Nothig value is extracted.`);
    return nothing();
  }
}

export namespace Maybe {
  export const mzero: Maybe<never> = new Nothing();
  export function mplus<a>(ml: Maybe<a>, mr: Nothing): Maybe<a>
  export function mplus<a>(ml: Nothing, mr: Maybe<a>): Maybe<a>
  export function mplus<a>(ml: Maybe<a>, mr: Maybe<a>): Maybe<a>
  export function mplus<a>(ml: Maybe<a>, mr: Maybe<a>): Maybe<a> {
    return new Maybe<a>(() =>
      ml
        .fmap(() => ml)
        .extract(() => mr));
  }
}

function throwCallError(): never {
  throw new Error(`Spica: Maybe: Invalid thunk call.`);
}
