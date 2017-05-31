import { noop } from './noop';
import { Maybe, Just, Nothing } from './monad/maybe';
import { Either, Left, Right } from './monad/either';

export class Cancellation<L = void> {
  private reason: L;
  private readonly listeners: Set<(reason: L) => void> = new Set();
  public readonly register = (listener: (reason: L) => void): () => void =>
    this.register_(listener);
  private register_ = (listener: (reason: L) => void): () => void => {
    void this.listeners.add(handler);
    return () => void this.listeners.delete(handler);

    function handler(reason: L): void {
      void listener(reason);
    }
  };
  public cancel: {
    (reason: L): void;
    (this: Cancellation<void>): void;
  } = (reason?: L) => {
    this.canceled = true;
    this.reason = reason!;
    this.register_ = cb => (
      void cb(this.reason),
      () => void 0);
    this.cancel = noop;
    this.close = noop;
    void Object.freeze(this);
    while (this.listeners.size > 0) {
      void this.listeners
        .forEach(cb => (
          void this.listeners.delete(cb),
          void cb(reason!)));
    }
    void Object.freeze(this.listeners);
  };
  public close = (): void => (
    this.register_ = () => () => void 0,
    this.cancel = noop,
    this.close = noop,
    void this.listeners.clear(),
    void Object.freeze(this),
    void Object.freeze(this.listeners));
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
