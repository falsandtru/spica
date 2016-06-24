import * as Monad from './maybe.impl';

export namespace Maybe {
  export const Return = Monad.Maybe.Return;
  export const mzero = Monad.Maybe.mzero;
  export const mplus = Monad.Maybe.mplus;
  export type Just<T> = Monad.Just<T>;
  export function Just<T>(val: T): Just<T> {
    return new Monad.Just(val);
  }
  export type Nothing = Monad.Nothing;
  export const Nothing = <Nothing>Monad.Maybe.mzero;
}

export type Maybe<T> = Monad.Maybe<T>;
export type Just<T> = Maybe.Just<T>;
export const Just = Maybe.Just;
export type Nothing = Maybe.Nothing;
export const Nothing = Maybe.Nothing;
export const Return = Maybe.Return;
