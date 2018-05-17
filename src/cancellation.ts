import { Future } from './future';
import { causeAsyncException } from './exception';
import { Maybe, Just, Nothing } from './monad/maybe';
import { Either, Left, Right } from './monad/either';

export interface Canceller<L = undefined> {
  readonly cancel: [L] extends [void] ? (reason?: L) => void : (reason: L) => void;
}
export interface Cancellee<L = undefined> {
  readonly register: (listener: (reason: L) => void) => () => void;
  readonly canceled: boolean;
  readonly promise: <T>(val: T) => Promise<T>;
  readonly maybe: <T>(val: T) => Maybe<T>;
  readonly either: <R>(val: R) => Either<L, R>;
}

export class Cancellation<L = undefined> extends Promise<L> implements Canceller<L>, Cancellee<L> {
  static get [Symbol.species]() {
    return Promise;
  }
  constructor(cancelees: Iterable<Cancellee<L>> = []) {
    super(res => resolve = res);
    var resolve!: (v: PromiseLike<L>) => void;
    void resolve(this.state);
    void [...cancelees]
      .forEach(cancellee =>
        void cancellee.register(this.cancel));
  }
  private alive = true;
  private canceled_ = false;
  private reason?: L;
  private readonly state: Future<L> = new Future();
  private readonly listeners: Set<(reason: L) => void> = new Set();
  public readonly register = (listener: (reason: L) => void) => {
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
    this.state.bind(this.reason);
    void Object.freeze(this.listeners);
    void Object.freeze(this);
    void this.listeners
      .forEach(cb =>
        void cb(reason!));
  }) as any;
  public readonly close = (reason?: any) => {
    if (!this.alive) return;
    this.alive = false;
    void this.state.bind(Promise.reject(reason));
    void Object.freeze(this.listeners);
    void Object.freeze(this);
  };
  public get canceled(): boolean {
    return this.canceled_;
  }
  public readonly promise = <T>(val: T): Promise<T> =>
    this.canceled_
      ? Promise.reject(this.reason)
      : Promise.resolve(val);
  public readonly maybe = <T>(val: T): Maybe<T> =>
    this.canceled_
      ? Nothing
      : Just(val);
  public readonly either = <R>(val: R): Either<L, R> =>
    this.canceled_
      ? Left(this.reason!)
      : Right(val);
}
