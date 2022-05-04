import { AtomicPromise, Internal as PromiseInternal, internal as promiseinternal } from './promise';
import { AtomicFuture } from './future';
import { causeAsyncException } from './exception';
import { Maybe, Just, Nothing } from './maybe';
import { Either, Left, Right } from './either';
import { noop } from './function';

export interface Canceller<L = undefined> {
  readonly cancel: {
    (reason: L): void;
    (this: Canceller<undefined>, reason?: L): void;
  };
  readonly close: (reason?: unknown) => void;
}
export interface Cancellee<L = undefined> extends Promise<L> {
  readonly isAlive: boolean;
  readonly isCancelled: boolean;
  readonly register: (listener: Listener<L>) => () => void;
  readonly promise: <T>(val: T) => AtomicPromise<T>;
  readonly maybe: <T>(val: T) => Maybe<T>;
  readonly either: <R>(val: R) => Either<L, R>;
}
type Listener<L> = (reason: L) => void;

const internal = Symbol.for('spica/cancellation::internal');

export class Cancellation<L = undefined> implements Canceller<L>, Cancellee<L>, AtomicPromise<L> {
  public readonly [Symbol.toStringTag]: string = 'Cancellation';
  constructor(cancellees: Iterable<Cancellee<L>> = []) {
    for (const cancellee of cancellees) {
      cancellee.register(this.cancel);
    }
  }
  public readonly [internal]: Internal<L> = new Internal();
  public get [promiseinternal](): PromiseInternal<L> {
    return this[internal].promise[promiseinternal];
  }
  public get isAlive(): boolean {
    return this[internal].reason.length === 0;
  }
  public get isCancelled(): boolean {
    return this[internal].reason.length === 1;
  }
  public get isClosed(): boolean {
    return this[internal].reason.length === 2;
  }
  public get isFinished(): boolean {
    return this[internal].reason.length !== 0;
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
  public get then(): AtomicPromise<L>['then'] {
    return this[internal].promise.then;
  }
  public get catch(): AtomicPromise<L>['catch'] {
    return this[internal].promise.catch;
  }
  public get finally(): AtomicPromise<L>['finally'] {
    return this[internal].promise.finally;
  }
  public get promise(): <T>(val: T) => AtomicPromise<T> {
    return <T>(val: T): AtomicPromise<T> =>
      this.isCancelled
        ? AtomicPromise.reject(this[internal].reason[0])
        : AtomicPromise.resolve(val);
  }
  public get maybe(): <T>(val: T) => Maybe<T> {
    return <T>(val: T): Maybe<T> =>
      Just(val)
        .bind(val =>
          this.isCancelled
            ? Nothing
            : Just(val));
  }
  public get either(): <R>(val: R) => Either<L, R> {
    return <R>(val: R): Either<L, R> =>
      Right<L, R>(val)
        .bind(val =>
          this.isCancelled
            ? Left(this[internal].reason[0] as L)
            : Right(val));
  }
}

class Internal<L> {
  public isFinished: boolean = false;
  public reason: [] | [L] | [void, unknown] = [];
  public future?: AtomicFuture<L>;
  public get promise(): AtomicPromise<L> {
    if (!this.future) {
      this.future = new AtomicFuture<L>();
      switch (this.reason.length) {
        case 1:
          return this.future.bind(this.reason[0]);
        case 2:
          return this.future.bind(AtomicPromise.reject(this.reason[1]));
      }
    }
    return this.future;
  }
  public readonly listeners: (Listener<L> | undefined)[] = [];
  public register(listener: Listener<L>): () => void {
    if (this.isFinished) {
      this.reason.length === 1 && handler(this.reason[0]);
      return noop;
    }
    const i = this.listeners.push(handler) - 1;
    return () => this.listeners[i] = void 0;

    function handler(reason: L): void {
      try {
        listener(reason);
      }
      catch (reason) {
        causeAsyncException(reason);
      }
    }
  }
  public cancel(reason?: L): void {
    if (this.reason.length !== 0) return;
    this.reason = [reason!];
    for (let i = 0, { listeners } = this; i < listeners.length; ++i) {
      listeners[i]?.(reason!);
    }
    this.future?.bind(reason!);
    this.isFinished = true;
  }
  public close(reason?: unknown): void {
    if (this.reason.length !== 0) return;
    this.reason = [, reason];
    this.future?.bind(AtomicPromise.reject(reason));
    this.isFinished = true;
  }
}
