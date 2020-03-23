import { AtomicPromise } from './promise';

export class Future<T = undefined> extends Promise<T> {
  static get [Symbol.species]() {
    return Promise;
  }
  constructor(strict = true) {
    let bind!: (value: T | PromiseLike<T>) => Promise<awaited T>;
    let state = true;
    super(resolve =>
      bind = value => {
        if (!state && !strict) return this.then();
        if (!state) throw new Error(`Spica: Future: Cannot rebind a value.`);
        state = false;
        void resolve(value);
        return this.then();
      });
    this.bind = bind;
  }
  public readonly bind: {
    (this: Future<undefined>, value?: awaited T | T | PromiseLike<T>): Promise<awaited T>;
    (value: awaited T | T | PromiseLike<T>): Promise<awaited T>;
  };
}

export class AtomicFuture<T = undefined> extends AtomicPromise<T> implements Future<T> {
  static get [Symbol.species]() {
    return AtomicPromise;
  }
  constructor(strict = true) {
    let bind!: (value: T | PromiseLike<T>) => AtomicPromise<awaited T>;
    let state = true;
    super(resolve =>
      bind = value => {
        if (!state && !strict) return this.then();
        if (!state) throw new Error(`Spica: AtomicFuture: Cannot rebind a value.`);
        state = false;
        void resolve(value);
        return this.then();
      });
    this.bind = bind;
  }
  public readonly bind: {
    (this: AtomicFuture<undefined>, value?: awaited T | T | PromiseLike<T>): AtomicPromise<awaited T>;
    (value: awaited T | T | PromiseLike<T>): AtomicPromise<awaited T>;
  };
}
