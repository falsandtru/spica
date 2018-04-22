import * as Monad from './either.impl';

export type Either<a, b> = Monad.Either<a, b>;
export namespace Either {
  export const fmap = Monad.Either.fmap;
  export const pure = Monad.Either.pure;
  export const ap = Monad.Either.ap;
  export const Return = Monad.Either.Return;
  export const bind = Monad.Either.bind;
  export const sequence = Monad.Either.sequence;
}

export type Left<a> = Monad.Left<a>;
export function Left<a>(a: a): Left<a>
export function Left<a, b>(a: a): Either<a, b>
export function Left<a, b>(a: a): Either<a, b> {
  return new Monad.Left<a>(a);
}
export type Right<b> = Monad.Right<b>;
export function Right<b>(b: b): Right<b>
export function Right<a, b>(b: b): Either<a, b>
export function Right<a, b>(b: b): Either<a, b> {
  return new Monad.Right<b>(b);
}
