import {Monad} from './monad';

export class Maybe<T> extends Monad<T> {
  protected MAYBE: Just<T> | Nothing;
  constructor(protected thunk?: () => Maybe<T>) {
    super(thunk);
  }
  public bind(f: (val: T) => Nothing): Nothing
  public bind<U>(f: (val: T) => Maybe<U>): Maybe<U>
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
  public fmap<U>(f: (val: T) => U): Maybe<U> {
    return this.bind(v => new Just(f(v)));
  }
  public extract(): T
  public extract<U>(transform: () => U): T | U
  public extract<U>(transform?: () => U): T | U {
    return this.evaluate().extract(transform);
  }
  public assert<S extends Maybe<T>>(type?: S): Maybe<T> {
    return this;
  }
}

export class Just<T> extends Maybe<T> {
  protected MAYBE: Just<T>;
  constructor(private val_: T) {
    super();
  }
  public bind(f: (val: T) => Nothing): Nothing
  public bind<U>(f: (val: T) => Maybe<U>): Maybe<U>
  public bind<U>(f: (val: T) => Maybe<U>): Maybe<U> {
    return new Maybe(() => this).bind(f);
  }
  public extract<U>(transform?: () => U): T {
    return this.val_;
  }
  public assert<S extends Just<T>>(type?: S): Just<T> {
    return this;
  }
}

export class Nothing extends Maybe<any> {
  protected MAYBE: Nothing;
  public bind(f: (val: any) => Maybe<any>): Nothing {
    return this;
  }
  public fmap(f: (val: any) => any): Nothing {
    return this;
  }
  public extract(): any
  public extract<U>(transform: () => U): U
  public extract<U>(transform?: () => U): U {
    if (!transform) throw void 0;
    return transform();
  }
  public assert<S extends Nothing>(type?: S): Nothing {
    return this;
  }
}
