import * as Monad from './maybe.impl';
import { noop } from '../function';

export class Maybe<a> extends Monad.Maybe<a> {
  private constructor() {
    super(noop as never);
  }
}

export type Just<a> = Monad.Just<a>;
export function Just<a>(a: a): Maybe<a> {
  return new Monad.Just(a);
}
export type Nothing = Monad.Nothing;
export const Nothing: Maybe<never> = Monad.Maybe.mzero;
