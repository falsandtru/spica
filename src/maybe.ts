import { AtomicPromise } from './promise';
import { curry } from './curry';

export interface Maybe<a> {
  fmap<b>(f: (a: a) => b): Maybe<b>;
  ap<a, z>(this: Maybe<(a: a) => z>, a: Maybe<a>): Maybe<z>
  ap<a, b, z>(this: Maybe<(a: a, b: b) => z>, a: Maybe<a>): Maybe<(b: b) => z>
  ap<a, b, c, z>(this: Maybe<(a: a, b: b, c: c) => z>, a: Maybe<a>): Maybe<(b: b, c: c) => z>
  ap<a, b, c, d, z>(this: Maybe<(a: a, b: b, c: c, d: d) => z>, a: Maybe<a>): Maybe<(b: b, c: c, d: d) => z>
  ap<a, b, c, d, e, z>(this: Maybe<(a: a, b: b, c: c, d: d, e: e) => z>, a: Maybe<a>): Maybe<(b: b, c: c, d: d, e: e) => z>
  bind<b>(f: (a: a) => Maybe<b>): Maybe<b>;
  join<b>(this: Maybe<Maybe<b>>): Maybe<b>;
  guard(cond: boolean): Maybe<a>;
  extract(): a;
  extract(nothing: () => a): a;
  extract<b>(nothing: () => b): a | b;
  extract<b>(nothing: () => b, just: (a: a) => b): b;
}

class Just<a> implements Maybe<a> {
  constructor(
    private readonly value: a,
  ) {
  }
  public fmap<b>(f: (a: a) => b): Just<b> {
    return new Just(f(this.value));
  }
  public ap<a, z>(this: Maybe<(a: a) => z>, a: Maybe<a>): Maybe<z>
  public ap<a, b, z>(this: Maybe<(a: a, b: b) => z>, a: Maybe<a>): Maybe<(b: b) => z>
  public ap<a, b, c, z>(this: Maybe<(a: a, b: b, c: c) => z>, a: Maybe<a>): Maybe<(b: b, c: c) => z>
  public ap<a, b, c, d, z>(this: Maybe<(a: a, b: b, c: c, d: d) => z>, a: Maybe<a>): Maybe<(b: b, c: c, d: d) => z>
  public ap<a, b, c, d, e, z>(this: Maybe<(a: a, b: b, c: c, d: d, e: e) => z>, a: Maybe<a>): Maybe<(b: b, c: c, d: d, e: e) => z>
  public ap<a, z>(this: Maybe<(...as: any[]) => z>, a: Maybe<a>): Maybe<z> {
    return Maybe.ap(this, a);
  }
  public bind<b>(f: (a: a) => Just<b>): Just<b>;
  public bind<b>(f: (a: a) => Maybe<b>): Maybe<b>;
  public bind<b>(f: (a: a) => Maybe<b>): Maybe<b> {
    return f(this.value);
  }
  public join<b>(this: Maybe<Maybe<b>>): Maybe<b> {
    return this.bind(m => m);
  }
  public guard(cond: boolean): Maybe<a> {
    return cond
      ? this
      : nothing;
  }
  public extract(): a;
  public extract(nothing: () => a): a;
  public extract<b>(nothing: () => b): a | b;
  public extract<b>(nothing: () => b, just: (a: a) => b): b;
  public extract<b>(nothing?: () => b, just?: (a: a) => b): a | b {
    if (just !== undefined) return just(this.value);
    return this.value;
    assert(nothing);
  }
}

class Nothing implements Maybe<never> {
  public fmap<b>(f: (a: never) => b): Nothing {
    return this;
    assert(f);
  }
  public ap<a, z>(this: Maybe<(a: a) => z>, a: Maybe<a>): Nothing;
  public ap<a, b, z>(this: Maybe<(a: a, b: b) => z>, a: Maybe<a>): Nothing;
  public ap<a, b, c, z>(this: Maybe<(a: a, b: b, c: c) => z>, a: Maybe<a>): Nothing;
  public ap<a, b, c, d, z>(this: Maybe<(a: a, b: b, c: c, d: d) => z>, a: Maybe<a>): Nothing;
  public ap<a, b, c, d, e, z>(this: Maybe<(a: a, b: b, c: c, d: d, e: e) => z>, a: Maybe<a>): Nothing;
  public ap<a, z>(this: Maybe<(...as: any[]) => z>, _: Maybe<a>): Nothing {
    return this as Nothing;
  }
  public bind<b>(f: (a: never) => Maybe<b>): Nothing {
    return this;
    assert(f);
  }
  public join<b>(this: Maybe<Maybe<b>>): Nothing {
    return this as Nothing;
  }
  public guard(cond: boolean): Nothing {
    return this;
    assert(cond);
  }
  public extract(): never;
  public extract<b>(transform: () => b): b;
  public extract<b>(nothing: () => b, just: (a: never) => b): b;
  public extract<b>(nothing?: () => b): b {
    if (nothing !== undefined) return nothing();
    throw new Error(`Spica: Maybe: Nothing value is extracted.`);
    assert(just);
  }
}

function just<a>(value: a): Just<a> {
  return new Just(value);
}
const nothing = new Nothing();

export {
  just as Just,
  nothing as Nothing,
};

export namespace Maybe {
  export function fmap<a, b>(m: Maybe<a>, f: (a: a) => b): Maybe<b>;
  export function fmap<a>(m: Maybe<a>): <b>(f: (a: a) => b) => Maybe<b>;
  export function fmap<a, b>(m: Maybe<a>, f?: (a: a) => b): Maybe<b> | (<b>(f: (a: a) => b) => Maybe<b>) {
    return f
      ? m.fmap(f)
      : <b>(f: (a: a) => b) => m.fmap(f);
  }
  export const pure = just;
  export function ap<a, b>(mf: Maybe<(a: a) => b>, ma: Maybe<a>): Maybe<b>;
  export function ap<a, b>(mf: Maybe<(a: a) => b>): (ma: Maybe<a>) => Maybe<b>;
  export function ap<a, b>(af: Maybe<(a: a) => b>, aa?: Maybe<a>): Maybe<b> | ((aa: Maybe<a>) => Maybe<b>) {
    return aa
      ? af.bind(f => aa.fmap(curry(f)))
      : (aa: Maybe<a>) => ap(af, aa);
  }
  export const Return = pure;
  export function bind<a, b>(m: Maybe<a>, f: (a: a) => Maybe<b>): Maybe<b>;
  export function bind<a>(m: Maybe<a>): <b>(f: (a: a) => Maybe<b>) => Maybe<b>;
  export function bind<a, b>(m: Maybe<a>, f?: (a: a) => Maybe<b>): Maybe<b> | (<b>(f: (a: a) => Maybe<b>) => Maybe<b>) {
    return f
      ? m.bind(f)
      : <b>(f: (a: a) => Maybe<b>) => bind(m, f);
  }
  export function sequence<a>(fm: Maybe<a>[]): Maybe<a[]>;
  export function sequence<a>(fm: Maybe<PromiseLike<a>>): AtomicPromise<Maybe<a>>;
  export function sequence<a>(fm: Maybe<a>[] | Maybe<PromiseLike<a>>): Maybe<a[]> | AtomicPromise<Maybe<a>> {
    return Array.isArray(fm)
      ? fm.reduce((acc, m) =>
          acc.bind(as =>
            m.fmap(a =>
              [...as, a]))
        , Return([]))
      : fm.extract(() => AtomicPromise.resolve(Maybe.mzero), a => AtomicPromise.resolve(a).then(Return))
  }
  export const mzero: Maybe<never> = nothing;
  export function mplus<a>(ml: Maybe<a>, mr: Maybe<a>): Maybe<a> {
    return ml.extract(() => mr, () => ml);
  }
}
