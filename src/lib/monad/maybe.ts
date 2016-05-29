import {Maybe as Maybe_, Just as Just_, Nothing as Nothing_} from './maybe.impl';

export namespace Maybe {
  export type Just<T> = Just_<T>;
  export function Just<T>(val: T): Just<T> {
    return new Just_(val);
  }
  export type Nothing = Nothing_;
  export const Nothing = new Nothing_();
  export const Return = Just;
}

export type Maybe<T> = Just<T> | Nothing | Maybe_<T>;
export type Just<T> = Maybe.Just<T>;
export const Just = Maybe.Just;
export type Nothing = Maybe.Nothing;
export const Nothing = Maybe.Nothing;
export const Return = Just;
