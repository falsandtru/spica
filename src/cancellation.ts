import { Set } from './global';
import { once } from './function';
import { noop } from './noop';
import { AtomicPromise } from './promise';
import { causeAsyncException } from './exception';
import { Maybe, Just, Nothing } from './monad/maybe';
import { Either, Left, Right } from './monad/either';

export interface Canceller<L = undefined> {
  readonly cancel: {
    (this: Canceller<undefined>, reason?: L): void;
    (reason: L): void;
  };
  readonly close: (reason?: unknown) => void;
}
export interface Cancellee<L = undefined> {
  readonly alive: boolean;
  readonly cancelled: boolean;
  readonly register: (listener: Listener<L>) => () => void;
  readonly promise: <T>(val: T) => AtomicPromise<T>;
  readonly maybe: <T>(val: T) => Maybe<T>;
  readonly either: <R>(val: R) => Either<L, R>;
}
type Listener<L> = (reason: L) => void;

const internal = Symbol.for('spica/cancellation::internal');

export class Cancellation<L = undefined> extends AtomicPromise<L> implements Canceller<L>, Cancellee<L> {
  constructor(cancelees: Iterable<Cancellee<L>> = []) {
    super(res => resolve = res);
    var resolve!: (v: L | PromiseLike<never>) => void;
    this[internal] = new Internal(resolve);
    for (const cancellee of cancelees) {
      cancellee.register(this.cancel);
    }
  }
  public readonly [internal]: Internal<L>;
  public get alive(): boolean {
    return this[internal].alive;
  }
  public get cancelled(): boolean {
    return this[internal].cancelled;
  }
  public get register(): (listener: Listener<L>) => () => void {
    return (listener: Listener<L>) =>
      this[internal].register(listener);
  }
  public get cancel(): Canceller<L>['cancel'] {
    return (reason?: L) =>
      this[internal].cancel(reason);
  }
  public get close(): (reason?: unknown) => void {
    return (reason?: unknown) =>
      this[internal].close(reason);
  }
  public get promise(): <T>(val: T) => AtomicPromise<T> {
    return <T>(val: T): AtomicPromise<T> =>
      this[internal].promise(val);
  }
  public get maybe(): <T>(val: T) => Maybe<T> {
    return <T>(val: T): Maybe<T> =>
      this[internal].maybe(val);
  }
  public get either(): <R>(val: R) => Either<L, R> {
    return <R>(val: R): Either<L, R> =>
      this[internal].either(val);
  }
}

class Internal<L> implements Canceller<L>, Cancellee<L> {
  constructor(
    public resolve: (reason: L | PromiseLike<never>) => void,
  ) {
  }
  public alive: boolean = true;
  public available: boolean = true;
  public reason?: L;
  public get cancelled(): boolean {
    return 'reason' in this;
  }
  public readonly listeners: Set<Listener<L>> = new Set();
  public register(listener: Listener<L>): () => void {
    if (!this.alive) {
      this.cancelled && handler(this.reason!);
      return noop;
    }
    this.listeners.add(handler);
    return once(() => void this.listeners.delete(handler));

    function handler(reason: L): void {
      try {
        listener(reason!);
      }
      catch (reason) {
        causeAsyncException(reason);
      }
    }
  }
  public cancel(reason?: L): void {
    if (!this.available) return;
    this.available = false;
    this.reason = reason!;
    for (const listener of this.listeners) {
      listener(reason!);
    }
    this.resolve(this.reason!);
    this.alive = false;
  }
  public close(reason?: unknown): void {
    if (!this.available) return;
    this.available = false;
    this.resolve(AtomicPromise.reject(reason));
    this.alive = false;
  }
  public promise<T>(val: T): AtomicPromise<T> {
    return this.cancelled
      ? AtomicPromise.reject(this.reason)
      : AtomicPromise.resolve(val);
  }
  public maybe<T>(val: T): Maybe<T> {
    return Just(val)
      .bind(val =>
        this.cancelled
          ? Nothing
          : Just(val));
  }
  public either<R>(val: R): Either<L, R> {
    return Right<L, R>(val)
      .bind(val =>
        this.cancelled
          ? Left(this.reason!)
          : Right(val));
  }
}
