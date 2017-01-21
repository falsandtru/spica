import { noop } from './noop';
import { Maybe, Just, Nothing } from './monad/maybe';
import { Either, Left, Right } from './monad/either';

export class Cancelable<L> {
  constructor() {
    this.cancel = (reason?: L) => (
      this.cancel = noop,
      this.canceled = true,
      this.reason = reason!,
      this.listeners
        .forEach(cb => void cb(reason!)),
      this.listeners.clear(),
      this.listeners.add = cb => (
        void cb(this.reason),
        this.listeners),
      void Object.freeze(this));
  }
  private reason: L;
  public readonly listeners: Set<(reason: L) => void> = new Set();
  public cancel: {
    (this: Cancelable<void | undefined>): void;
    (reason: L): void;
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
