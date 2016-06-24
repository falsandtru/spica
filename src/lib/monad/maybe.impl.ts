import {MonadPlus} from './monadplus';

export class Maybe<T> extends MonadPlus<T> {
  protected MAYBE: Just<T> | Nothing;
  constructor(thunk: () => Maybe<T>) {
    super(thunk);
  }
  public fmap<U>(f: (val: T) => U): Maybe<U> {
    return this.bind(v => new Just(f(v)));
  }
  public bind<U>(f: (val: T) => Maybe<U>): Maybe<U> {
    return new Maybe<U>(() => {
      const m: Maybe<T> = this.evaluate();
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
  public extract(): T
  public extract<U>(transform: () => U): T | U
  public extract<U>(transform?: () => U): T | U {
    return this.evaluate().extract(transform);
  }
}
export namespace Maybe {
  export function Return<T>(val: T): Maybe<T> {
    return new Just(val);
  }
}

export class Just<T> extends Maybe<T> {
  protected MAYBE: Just<T>;
  constructor(private val_: T) {
    super(throwCallError);
  }
  public bind<U>(f: (val: T) => Maybe<U>): Maybe<U> {
    return new Maybe(() => f(this.extract()));
  }
  public extract<U>(transform?: () => U): T {
    return this.val_;
  }
}

export class Nothing extends Maybe<any> {
  protected MAYBE: Nothing;
  constructor() {
    super(throwCallError);
  }
  public bind(f: (val: any) => Maybe<any>): Nothing {
    return this;
  }
  public extract(): any
  public extract<U>(transform: () => U): U
  public extract<U>(transform?: () => U): U {
    if (!transform) throw void 0;
    return transform();
  }
}

export namespace Maybe {
  export const mzero: Maybe<any> = new Nothing();
  export function mplus<T>(a: Maybe<T>, b: Maybe<T>): Maybe<T> {
    return new Maybe<T>(() =>
      a
        .fmap(() => a)
        .extract(() => b));
  }
}

function throwCallError<T>(): T {
  throw new Error(`Spica: Maybe: Invalid thunk call.`);
}
