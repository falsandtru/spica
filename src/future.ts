import { AtomicPromise, Internal, internal } from './promise';

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
  private readonly [state]: {
    pending: boolean,
    resolve: (value: T | PromiseLike<T>) => void,
  };
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

export interface AtomicFuture<T> extends AtomicPromise<T> { }
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
}
AtomicFuture.prototype.then = AtomicPromise.prototype.then;
AtomicFuture.prototype.catch = AtomicPromise.prototype.catch;
AtomicFuture.prototype.finally = AtomicPromise.prototype.finally;
