import * as Monad from './maybe.impl';

export class Maybe<a> extends Monad.Maybe<a> {
  private constructor() {
    super(() => void 0 as never);
  }
}

export function Just<a>(a: a): Maybe<a> {
  return new Monad.Just(a);
}
export const Nothing: Maybe<never> = Monad.Maybe.mzero;
