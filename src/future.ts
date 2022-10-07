import { Promise } from './global';
import { AtomicPromise, Internal, internal } from './promise';
import { noop } from './function';

const state = Symbol('spica/future::state');

export class Future<T = undefined> extends Promise<T> {
  public static get [Symbol.species]() {
    return Promise;
  }
  constructor(private readonly strict: boolean = true) {
    let resolve!: (v: T | PromiseLike<T>) => void;
    super(r => resolve = r);
    this[state] = {
      pending: true,
      resolve,
    };
  }
  private bind$(value: T | PromiseLike<T>): Promise<T>;
  private bind$(this: Future<undefined>, value?: T | PromiseLike<T>): Promise<T>;
  private bind$(value: T | PromiseLike<T>): Promise<T> {
    if (this[state].pending) {
      this[state].pending = false;
      this[state].resolve(value);
    }
    else if (this.strict) {
      throw new Error(`Spica: Future: Cannot rebind the value.`);
    }
    return this;
  }
  public get bind(): Future<T>['bind$'] {
    return value => this.bind$(value!);
  }
}

export class AtomicFuture<T = undefined> implements AtomicPromise<T> {
  public readonly [Symbol.toStringTag]: string = 'Promise';
  constructor(private readonly strict: boolean = true) {
  }
  public readonly [internal] = new Internal<T>();
  private bind$(value: T | PromiseLike<T>): AtomicPromise<T>;
  private bind$(this: AtomicFuture<undefined>, value?: T | PromiseLike<T>): AtomicPromise<T>;
  private bind$(value: T | PromiseLike<T>): AtomicPromise<T> {
    if (this[internal].isPending()) {
      this[internal].resolve(value);
    }
    else if (this.strict) {
      throw new Error(`Spica: AtomicFuture: Cannot rebind the value.`);
    }
    return this;
  }
  public get bind(): AtomicFuture<T>['bind$'] {
    return value => this.bind$(value!);
  }
  public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null): AtomicPromise<TResult1 | TResult2> {
    const p = new AtomicPromise<TResult1 | TResult2>(noop);
    this[internal].then(p[internal], onfulfilled, onrejected);
    return p;
  }
  public catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | undefined | null): AtomicPromise<T | TResult> {
    return this.then(void 0, onrejected);
  }
  public finally(onfinally?: (() => void) | undefined | null): AtomicPromise<T> {
    return this.then(onfinally, onfinally).then(() => this);
  }
}
