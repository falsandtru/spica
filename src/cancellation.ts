import { global } from './global';
import { AtomicPromise } from './promise';
import { causeAsyncException } from './exception';
import { Maybe, Just, Nothing } from './monad/maybe';
import { Either, Left, Right } from './monad/either';

const { Object: Obj } = global;

export interface Canceller<L = undefined> {
  readonly cancel: {
    (this: Canceller<void>, reason?: L): void;
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

export class Cancellation<L = undefined> extends AtomicPromise<L> implements Canceller<L>, Cancellee<L> {
  static get [Symbol.species]() {
    return AtomicPromise;
  }
  constructor(cancelees: Iterable<Cancellee<L>> = []) {
    super(res => resolve = res);
    var resolve!: (v: L | PromiseLike<never>) => void;
    this.resolve = resolve;
    for (const cancellee of cancelees) {
      void cancellee.register(this.cancel);
    }
  }
  private alive = true;
  private canceled_ = false;
  private reason?: L;
  private resolve: (reason: L | PromiseLike<never>) => void;
  private readonly listeners: Set<(reason: L) => void> = new Set();
  public readonly register = (listener: (reason: L) => void) => {
    assert(listener);
    if (this.canceled_) return void handler(this.reason!), () => undefined;
    if (!this.alive) return () => undefined;
    void this.listeners.add(handler);
    return () =>
      this.alive
        ? void this.listeners.delete(handler)
        : undefined;

    function handler(reason: L): void {
      try {
        void listener(reason);
      }
      catch (reason) {
        void causeAsyncException(reason);
      }
    }
  };
  public readonly cancel: Canceller<L>['cancel'] = ((reason?: L) => {
    if (!this.alive) return;
    this.alive = false;
    this.canceled_ = true;
    this.reason = reason!;
    this.resolve(this.reason);
    void Obj.freeze(this.listeners);
    void Obj.freeze(this);
    for (const listener of this.listeners) {
      void listener(reason!);
    }
  });
  public readonly close = (reason?: unknown) => {
    if (!this.alive) return;
    this.alive = false;
    void this.resolve(AtomicPromise.reject(reason));
    void Obj.freeze(this.listeners);
    void Obj.freeze(this);
  };
  public get canceled(): boolean {
    return this.canceled_;
  }
  public readonly promise = <T>(val: T): AtomicPromise<T> =>
    this.canceled_
      ? AtomicPromise.reject(this.reason)
      : AtomicPromise.resolve(val);
  public readonly maybe = <T>(val: T): Maybe<T> =>
    Just(val)
      .bind(val =>
        this.canceled_
          ? Nothing
          : Just(val));
  public readonly either = <R>(val: R): Either<L, R> =>
    Right(val)
      .bind<R, L>(val =>
        this.canceled_
          ? Left(this.reason!)
          : Right(val));
}
