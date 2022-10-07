import { AtomicPromise, Internal, internal } from './promise';
import { Maybe, Just, Nothing } from './maybe';
import { Either, Left, Right } from './either';
import { noop } from './function';
import { causeAsyncException } from './exception';

export interface Canceller<L = undefined> {
  readonly cancel: {
    (reason: L): void;
    (this: Canceller<undefined>, reason?: L): void;
  };
  readonly close: (reason?: unknown) => void;
}
export interface Cancellee<L = undefined> extends Promise<L> {
  isAlive(): boolean;
  isCancelled(): boolean;
  readonly register: (listener: Listener<L>) => () => void;
  readonly promise: <T>(value: T) => AtomicPromise<T>;
  readonly maybe: <T>(value: T) => Maybe<T>;
  readonly either: <R>(value: R) => Either<L, R>;
}
type Listener<L> = (reason: L) => void;

export interface Cancellation<L> extends AtomicPromise<L> { }
export class Cancellation<L = undefined> implements Canceller<L>, Cancellee<L>, AtomicPromise<L> {
  public readonly [Symbol.toStringTag]: string = 'Cancellation';
  constructor(cancellees?: Iterable<Cancellee<L>>) {
    if (cancellees) for (const cancellee of cancellees) {
      cancellee.register(this.cancel);
    }
  }
  private reason: [] | [L] | [void, unknown] = [];
  private listeners: Listener<L>[] = [];
  public readonly [internal] = new Internal<L>();
  public isAlive(): boolean {
    return this.reason.length === 0;
  }
  public isCancelled(): boolean {
    return this.reason.length === 1;
  }
  public isClosed(): boolean {
    return this.reason.length === 2;
  }
  public register$(listener: Listener<L>): () => void {
    const { listeners, reason } = this;
    if (reason.length !== 0 && listeners.length === 0) {
      reason.length === 1 && handler(reason[0]);
      return noop;
    }
    listeners.push(handler);
    return () => void (listener = noop);

    function handler(reason: L): void {
      try {
        listener(reason);
      }
      catch (reason) {
        causeAsyncException(reason);
      }
    }
  }
  public get register(): (listener: Listener<L>) => () => void {
    return listener => this.register$(listener);
  }
  public cancel$(reason?: L): void {
    if (this.reason.length !== 0) return;
    this.reason = [reason!];
    for (let { listeners } = this, i = 0; i < listeners.length; ++i) {
      listeners[i](reason!);
    }
    this.listeners = [];
    assert(Object.freeze(this.listeners));
    this[internal].resolve(reason!);
  }
  public get cancel(): (reason?: L) => void {
    return reason => this.cancel$(reason);
  }
  public close$(reason?: unknown): void {
    if (this.reason.length !== 0) return;
    this.reason = [void 0, reason];
    this.listeners = [];
    assert(Object.freeze(this.listeners));
    this[internal].resolve(AtomicPromise.reject(reason));
  }
  public get close(): (reason?: unknown) => void {
    return reason => this.close$(reason);
  }
  public get promise(): <T>(value: T) => AtomicPromise<T> {
    return value =>
      this.isCancelled()
        ? AtomicPromise.reject(this.reason[0])
        : AtomicPromise.resolve(value);
  }
  public get maybe(): <T>(value: T) => Maybe<T> {
    return value =>
      Just(value)
        .bind(value =>
          this.isCancelled()
            ? Nothing
            : Just(value));
  }
  public get either(): <R>(value: R) => Either<L, R> {
    return value =>
      Right<L, typeof value>(value)
        .bind(value =>
          this.isCancelled()
            ? Left(this.reason[0] as L)
            : Right(value));
  }
}
Cancellation.prototype.then = AtomicPromise.prototype.then;
Cancellation.prototype.catch = AtomicPromise.prototype.catch;
Cancellation.prototype.finally = AtomicPromise.prototype.finally;
