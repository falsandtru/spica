import { causeAsyncException } from './exception';
import { Maybe, Just, Nothing } from './monad/maybe';
import { Either, Left, Right } from './monad/either';

export interface Canceller<L = void> {
  readonly cancel: {
    (reason: L): void;
    (this: Cancellation<void>): void;
  };
}
export interface Cancellee<L = void> {
  readonly register: (listener: (reason: L) => void) => () => void;
  readonly canceled: boolean;
  readonly promise: <T>(val: T) => Promise<T>;
  readonly maybe: <T>(val: T) => Maybe<T>;
  readonly either: <R>(val: R) => Either<L, R>;
}

export class Cancellation<L = void>
  implements Canceller<L>, Cancellee<L> {
  constructor(cancelees: Iterable<Cancellee<L>> = []) {
    void Array.from(cancelees)
      .forEach(cancellee =>
        void cancellee.register(this.cancel));
  }
  private done = false;
  private reason: L;
  private readonly listeners: Set<(reason: L) => void> = new Set();
  public readonly register = (listener: (reason: L) => void) => {
    if (this.canceled) return void handler(this.reason), () => void 0;
    if (this.done) return () => void 0;
    void this.listeners.add(handler);
    return () =>
      this.done
        ? void 0
        : void this.listeners.delete(handler);

    function handler(reason: L): void {
      try {
        void listener(reason);
      }
      catch (reason) {
        void causeAsyncException(reason);
      }
    }
  };
  public readonly cancel = (reason?: L) => {
    if (this.done) return;
    this.done = true;
    this.canceled = true;
    this.reason = reason!;
    void Object.freeze(this.listeners);
    void Object.freeze(this);
    void this.listeners
      .forEach(cb =>
        void cb(reason!));
  };
  public readonly close = () => {
    if (this.done) return;
    this.done = true;
    void Object.freeze(this.listeners);
    void Object.freeze(this);
  };
  public canceled = false;
  public readonly promise = <T>(val: T): Promise<T> =>
    this.canceled
      ? new Promise<T>((_, reject) => void reject(this.reason))
      : Promise.resolve(val);
  public readonly maybe = <T>(val: T): Maybe<T> =>
    this.canceled
      ? Nothing
      : Just(val);
  public readonly either = <R>(val: R): Either<L, R> =>
    this.canceled
      ? Left(this.reason)
      : Right(val);
}
