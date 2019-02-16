import { AtomicPromise } from './promise';

export class Future<T = unknown> extends Promise<T> {
  static get [Symbol.species]() {
    return Promise;
  }
  constructor() {
    let state = true;
    let bind!: (value: T | PromiseLike<T>) => Future<T>;
    super(resolve =>
      bind = value => {
        if (!state) throw new Error(`Spica: Future: Cannot rebind a value.`);
        state = false;
        void resolve(value);
        return this;
      });
    this.bind = bind;
  }
  public readonly bind: (value: T | PromiseLike<T>) => Promise<T>;
}

export class AtomicFuture<T = unknown> extends AtomicPromise<T> implements Future<T> {
  static get [Symbol.species]() {
    return AtomicPromise;
  }
  constructor() {
    let state = true;
    let bind!: (value: T | PromiseLike<T>) => AtomicFuture<T>;
    super(resolve =>
      bind = value => {
        if (!state) throw new Error(`Spica: AtomicFuture: Cannot rebind a value.`);
        state = false;
        void resolve(value);
        return this;
      });
    this.bind = bind;
  }
  public readonly bind: (value: T | PromiseLike<T>) => AtomicPromise<T>;
}
