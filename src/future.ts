import { AtomicPromise } from './promise';

export class Future<T = undefined> extends Promise<T> {
  public static get [Symbol.species]() {
    return Promise;
  }
  constructor(strict = true) {
    let bind!: (value: T | PromiseLike<T>) => Promise<T>;
    let done = false;
    super(resolve =>
      bind = value => {
        if (done && !strict) return this.then();
        if (done) throw new Error(`Spica: Future: Cannot rebind a value.`);
        done = true;
        void resolve(value);
        return this.then();
      });
    this.bind = bind;
  }
  public readonly bind: {
    (this: Future<undefined>, value?: T | PromiseLike<T>): Promise<T>;
    (value: T | PromiseLike<T>): Promise<T>;
  };
}

export class AtomicFuture<T = undefined> extends AtomicPromise<T> implements Future<T> {
  constructor(strict = true) {
    let bind!: (value: T | PromiseLike<T>) => AtomicPromise<T>;
    let done = false;
    super(resolve =>
      bind = value => {
        if (done && !strict) return this.then();
        if (done) throw new Error(`Spica: AtomicFuture: Cannot rebind a value.`);
        done = true;
        void resolve(value);
        return this.then();
      });
    this.bind = bind;
  }
  public readonly bind: {
    (this: AtomicFuture<undefined>, value?: T | PromiseLike<T>): AtomicPromise<T>;
    (value: T | PromiseLike<T>): AtomicPromise<T>;
  };
}
