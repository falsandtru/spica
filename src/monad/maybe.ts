import * as Monad from './maybe.impl';

export type Maybe<a> = Monad.Maybe<a>;
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

export function Just<a>(a: a): Maybe<a> {
  return new Monad.Just(a);
}
export const Nothing: Maybe<never> = Monad.Maybe.mzero;
