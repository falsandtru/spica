import * as Monad from './maybe.impl';

export namespace Maybe {
  export type Just<T> = Monad.Just<T>;
  export function Just<T>(val: T): Just<T> {
    return new Monad.Just(val);
  }
  export type Nothing = Monad.Nothing;
  export const Nothing = new Monad.Nothing();
  export const Return = Just;
}

export type Maybe<T> = Monad.Maybe<T>;
export type Just<T> = Maybe.Just<T>;
export const Just = Maybe.Just;
export type Nothing = Maybe.Nothing;
export const Nothing = Maybe.Nothing;
export const Return = Just;
