import {MonadPlus} from './monadplus';

export class Maybe<a> extends MonadPlus<a> {
  protected MAYBE: Just<a> | Nothing;
  constructor(thunk: () => Maybe<a>) {
    super(thunk);
  }
  public fmap<b>(f: (a: a) => b): Maybe<b> {
    return this.bind(a => new Just(f(a)));
  }
  public bind(f: (a: a) => Nothing): Maybe<a>
  public bind<b>(f: (a: a) => Maybe<b> | Nothing): Maybe<b>
  public bind<b>(f: (a: a) => Maybe<b> | Nothing): Maybe<b> {
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
      throw new TypeError(`Spica: Maybe: Invalid monad value.\n\t${m}`);
    });
  }
  public extract(): a
  public extract<b>(transform: () => b): a | b
  public extract<b>(nothing: () => b, just: (a: a) => b): b
  public extract<b>(nothing?: () => b, just?: (a: a) => b): a | b {
    return !just
      ? this.evaluate().extract(nothing!)
      : this.fmap(just).extract(nothing!);
  }
}
export namespace Maybe {
  export declare function fmap<a, b>(m: Maybe<a>, f: (a: a) => b): Maybe<b>
  export declare function fmap<a>(m: Maybe<a>): <b>(f: (a: a) => b) => Maybe<b>
  export function pure<a>(a: a): Maybe<a> {
    return new Just(a);
  }
  export declare function ap<a, b>(ff: Maybe<(a: a) => b>, fa: Maybe<a>): Maybe<b>
  export declare function ap<a, b>(ff: Maybe<(a: a) => b>): (fa: Maybe<a>) => Maybe<b>
  export const Return = pure;
  export declare function bind<a>(m: Maybe<a>, f: (a: a) => Nothing): Maybe<a>
  export declare function bind<a, b>(m: Maybe<a>, f: (a: a) => Maybe<b> | Nothing): Maybe<b>
  export declare function bind<a>(m: Maybe<a>): {
    (f: (a: a) => Nothing): Maybe<a>;
    <b>(f: (a: a) => Maybe<b> | Nothing): Maybe<b>;
  }
}

export class Just<a> extends Maybe<a> {
  protected MAYBE: Just<a>;
  protected JUST: a;
  constructor(private a: a) {
    super(throwCallError);
  }
  public bind(f: (a: a) => Nothing): Maybe<a>
  public bind<b>(f: (a: a) => Maybe<b> | Nothing): Maybe<b>
  public bind<b>(f: (a: a) => Maybe<b> | Nothing): Maybe<b> {
    return new Maybe(() => f(this.extract()));
  }
  public extract(): a
  public extract<b>(transform: () => b): a
  public extract<b>(nothing: () => b, just: (a: a) => b): b
  public extract<b>(_?: () => b, just?: (a: a) => b): a | b {
    return !just
      ? this.a
      : just(this.a);
  }
}

export class Nothing extends Maybe<any> {
  protected MAYBE: Nothing;
  protected NOTHING: void;
  constructor() {
    super(throwCallError);
  }
  public bind(f: (a: any) => Nothing): Nothing
  public bind<b>(f: (a: any) => Maybe<b> | Nothing): Maybe<b>
  public bind<b>(_: (a: any) => Maybe<b> | Nothing): Maybe<b> {
    return this;
  }
  public extract(): any
  public extract<b>(transform: () => b): b
  public extract<b>(nothing: () => b, just: (a: void) => b): b
  public extract<b>(nothing?: () => b): b {
    if (!nothing) throw void 0;
    return nothing();
  }
}

export namespace Maybe {
  export const mzero: Nothing = new Nothing();
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
