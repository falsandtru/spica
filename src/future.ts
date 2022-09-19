import { Promise } from './global';
import { AtomicPromise, Internal, internal } from './promise';

export class Future<T = undefined> extends Promise<T> {
  public static get [Symbol.species]() {
    return Promise;
  }
  constructor(strict: boolean = true) {
    let resolve!: (v: T | PromiseLike<T>) => void;
    super(r => resolve = r);
    let done = false;
    this.bind = (value: T | PromiseLike<T>): Promise<T> => {
      if (done) {
        if (!strict) return this;
        throw new Error(`Spica: Future: Cannot rebind the value.`);
      }
      done = true;
      resolve(value);
      return this;
    };
  }
  public bind(value: T | PromiseLike<T>): Promise<T>;
  public bind(this: Future<undefined>, value?: T | PromiseLike<T>): Promise<T>;
  public bind(value: T | PromiseLike<T>): Promise<T> {
    throw value;
  }
}

export class AtomicFuture<T = undefined> implements AtomicPromise<T> {
  public readonly [Symbol.toStringTag]: string = 'Promise';
  constructor(strict: boolean = true) {
    let done = false;
    this.bind = (value: T | PromiseLike<T>): AtomicPromise<T> => {
      if (done) {
        if (!strict) return this;
        throw new Error(`Spica: AtomicFuture: Cannot rebind the value.`);
      }
      done = true;
      this[internal].resolve(value);
      return this;
    };
  }
  public readonly [internal] = new Internal<T>();
  public bind(value: T | PromiseLike<T>): AtomicPromise<T>;
  public bind(this: AtomicFuture<undefined>, value?: T | PromiseLike<T>): AtomicPromise<T>;
  public bind(value: T | PromiseLike<T>): AtomicPromise<T> {
    throw value;
  }
  public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null): AtomicPromise<TResult1 | TResult2> {
    return new AtomicPromise((resolve, reject) =>
      this[internal].then(resolve, reject, onfulfilled, onrejected));
  }
  public catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | undefined | null): AtomicPromise<T | TResult> {
    return this.then(void 0, onrejected);
  }
  public finally(onfinally?: (() => void) | undefined | null): AtomicPromise<T> {
    return this.then(onfinally, onfinally).then(() => this);
  }
}
