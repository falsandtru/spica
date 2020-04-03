import { undefined, Promise } from './global';
import { AtomicPromise, Internal } from './promise';

const internal = Symbol.for('spica/promise::internal');

export class Future<T = undefined> implements Promise<T> {
  public static get [Symbol.species]() {
    return Promise;
  }
  public readonly [Symbol.toStringTag] = 'Promise';
  constructor(strict: boolean = true) {
    this.bind = (value: T) => {
      const core = this[internal];
      if (!core.isPending && !strict) return this;
      if (!core.isPending) throw new Error(`Spica: Future: Cannot rebind a value.`);
      core.resolve(value);
      core.resume();
      return this;
    };
  }
  public readonly [internal]: Internal<T> = new Internal();
  public readonly bind: {
    (this: Future<undefined>, value?: T | PromiseLike<T>): Future<T>;
    (value: T | PromiseLike<T>): Future<T>;
  };
  public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
    return new Promise((resolve, reject) =>
      this[internal].then(onfulfilled, onrejected, resolve, reject));
  }
  public catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult> {
    return this.then(undefined, onrejected);
  }
  public finally(onfinally?: (() => void) | undefined | null): Promise<T> {
    return this.then(onfinally, onfinally).then(() => this);
  }
}

export class AtomicFuture<T = undefined> implements Future<T> {
  public static get [Symbol.species]() {
    return AtomicPromise;
  }
  public readonly [Symbol.toStringTag] = 'Promise';
  constructor(strict: boolean = true) {
    this.bind = (value: T) => {
      if (!this[internal].isPending && !strict) return this;
      if (!this[internal].isPending) throw new Error(`Spica: AtomicFuture: Cannot rebind a value.`);
      this[internal].resolve(value);
      this[internal].resume();
      return this;
    };
  }
  public readonly [internal]: Internal<T> = new Internal();
  public readonly bind: {
    (this: AtomicFuture<undefined>, value?: T | PromiseLike<T>): AtomicFuture<T>;
    (value: T | PromiseLike<T>): AtomicFuture<T>;
  };
  public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null): AtomicPromise<TResult1 | TResult2> {
    return new AtomicPromise((resolve, reject) =>
      this[internal].then(onfulfilled, onrejected, resolve, reject));
  }
  public catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | undefined | null): AtomicPromise<T | TResult> {
    return this.then(undefined, onrejected);
  }
  public finally(onfinally?: (() => void) | undefined | null): AtomicPromise<T> {
    return this.then(onfinally, onfinally).then(() => this);
  }
}
