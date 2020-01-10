import { AtomicPromise } from './promise';

export class Future<T = unknown> extends Promise<T> {
  static get [Symbol.species]() {
    return Promise;
  }
  constructor() {
    let bind!: (value: T | PromiseLike<T>) => Future<T>;
    super(resolve =>
      bind = value => {
        void resolve(value);
        return this;
      });
    this.bind = bind;
  }
  public readonly bind: {
    (this: Future<undefined>, value?: T | PromiseLike<T>): Promise<T>;
    (value: T | PromiseLike<T>): Promise<T>;
  };
}

export class AtomicFuture<T = undefined> extends AtomicPromise<T> implements Future<T> {
  static get [Symbol.species]() {
    return AtomicPromise;
  }
  constructor() {
    let bind!: (value: T | PromiseLike<T>) => AtomicFuture<T>;
    super(resolve =>
      bind = value => {
        void resolve(value);
        return this;
      });
    this.bind = bind;
  }
  public readonly bind: {
    (this: AtomicFuture<undefined>, value?: T | PromiseLike<T>): AtomicPromise<T>;
    (value: T | PromiseLike<T>): AtomicPromise<T>;
  };
}
