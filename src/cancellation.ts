import { Set } from './global';
import { ObjectFreeze } from './alias';
import { AtomicPromise } from './promise';
import { causeAsyncException } from './exception';
import { Maybe, Just, Nothing } from './monad/maybe';
import { Either, Left, Right } from './monad/either';

export interface Canceller<L = undefined> {
  readonly cancel: {
    (this: Canceller<undefined>, reason?: L): void;
    (reason: L): void;
  };
}
export interface Cancellee<L = undefined> {
  readonly register: (listener: (reason: L) => void) => () => void;
  readonly canceled: boolean;
  readonly promise: <T>(val: T) => AtomicPromise<T>;
  readonly maybe: <T>(val: T) => Maybe<T>;
  readonly either: <R>(val: R) => Either<L, R>;
}

class Internal<L> {
  constructor(
    public resolve: (reason: L | PromiseLike<never>) => void,
  ) {
  }
  public alive: boolean = true;
  public available: boolean = true;
  public canceled: boolean = false;
  public reason?: L;
  public readonly listeners: Set<(reason: L) => void> = new Set();
}

const internal = Symbol.for('spica/cancellation::internal');

export class Cancellation<L = undefined> extends AtomicPromise<L> implements Canceller<L>, Cancellee<L> {
  static get [Symbol.species]() {
    return AtomicPromise;
  }
  constructor(cancelees: Iterable<Cancellee<L>> = []) {
    super(res => resolve = res);
    var resolve!: (v: L | PromiseLike<never>) => void;
    this[internal] = new Internal(resolve);
    for (const cancellee of cancelees) {
      void cancellee.register(this.cancel);
    }
  }
  public [internal]: Internal<L>;
  public readonly register = (listener: (reason: L) => void) => {
    assert(listener);
    if (!this[internal].alive) {
      if (this[internal].canceled) {
        void handler(this[internal].reason!);
      }
      return () => void 0;
    }
    void this[internal].listeners.add(handler);
    return () =>
      this[internal].alive && this[internal].listeners.has(handler)
        ? void this[internal].listeners.delete(handler)
        : void 0;

    function handler(reason: L): void {
      try {
        void listener(reason);
      }
      catch (reason) {
        void causeAsyncException(reason);
      }
    }
  };
  public readonly cancel: Canceller<L>['cancel'] = (reason?: L) => {
    if (!this[internal].available) return;
    this[internal].available = false;
    this[internal].canceled = true;
    this[internal].reason = reason!;
    this[internal].resolve(this[internal].reason!);
    void ObjectFreeze(this);
    for (const listener of this[internal].listeners) {
      void listener(reason!);
    }
    this[internal].alive = false;
    void ObjectFreeze(this[internal]);
  };
  public readonly close = (reason?: unknown) => {
    if (!this[internal].available) return;
    this[internal].available = false;
    void this[internal].resolve(AtomicPromise.reject(reason));
    this[internal].alive = false;
    void ObjectFreeze(this[internal]);
    void ObjectFreeze(this);
  };
  public get canceled(): boolean {
    return this[internal].canceled;
  }
  public readonly promise = <T>(val: T): AtomicPromise<T> =>
    this[internal].canceled
      ? AtomicPromise.reject(this[internal].reason)
      : AtomicPromise.resolve(val);
  public readonly maybe = <T>(val: T): Maybe<T> =>
    Just(val)
      .bind(val =>
        this[internal].canceled
          ? Nothing
          : Just(val));
  public readonly either = <R>(val: R): Either<L, R> =>
    Right(val)
      .bind<R, L>(val =>
        this[internal].canceled
          ? Left(this[internal].reason!)
          : Right(val));
}
