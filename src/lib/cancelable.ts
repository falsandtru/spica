import { noop } from './noop';
import { Maybe, Just, Nothing } from './monad/maybe';
import { Either, Left, Right } from './monad/either';

export class Cancelable<L> {
  private reason: L;
  public readonly listeners: Set<(reason: L) => void> = new Set();
  public canceled = false;
  public cancel: {
    (reason: L): void;
    (this: Cancelable<void>): void;
  } = (reason?: L) => {
    this.cancel = noop;
    this.canceled = true;
    this.reason = reason!;
    void Object.freeze(this);
    while (this.listeners.size > 0) {
      void this.listeners
        .forEach(cb => (
          void this.listeners.delete(cb),
          void cb(reason!)));
    }
    this.listeners.add = cb => (
      void cb(this.reason),
      this.listeners);
  };
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
