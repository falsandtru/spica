import * as Monad from './either.impl';

export namespace Either {
  export const fmap = Monad.Either.fmap;
  export const pure = Monad.Either.pure;
  export const ap = Monad.Either.ap;
  export const Return = Monad.Either.Return;
  export const bind = Monad.Either.bind;
  export type Left<a> = Monad.Left<a>;
  export function Left<a>(a: a): Left<a> {
    return new Monad.Left<a>(a);
  }
  export type Right<b> = Monad.Right<b>;
  export function Right<b>(b: b): Right<b> {
    return new Monad.Right<b>(b);
  }
}

export type Either<a, b> = Monad.Either<a, b>;
export type Left<a> = Either.Left<a>;
export const Left = Either.Left;
export type Right<b> = Either.Right<b>;
export const Right = Either.Right;
export const Return = Either.Return;
