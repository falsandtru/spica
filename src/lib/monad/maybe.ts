import * as Monad from './maybe.impl';

export namespace Maybe {
  export const fmap = Monad.Maybe.fmap;
  export const pure = Monad.Maybe.pure;
  export const ap = Monad.Maybe.ap;
  export const Return = Monad.Maybe.Return;
  export const bind = Monad.Maybe.bind;
  export const sequence = Monad.Maybe.sequence;
  export const mzero = Monad.Maybe.mzero;
  export const mplus = Monad.Maybe.mplus;
}

export type Maybe<a> = Monad.Maybe<a>;
export type Just<a> = Monad.Just<a>;
export function Just<a>(a: a): Just<a> {
  return new Monad.Just(a);
}
export type Nothing = Monad.Nothing;
export const Nothing = <Nothing>Monad.Maybe.mzero;
