import * as Monad from './either.impl';

export namespace Either {
  export const Return = Monad.Either.Return;
  export type Left<L> = Monad.Left<L>;
  export function Left<L>(val: L): Left<L> {
    return new Monad.Left<L>(val);
  }
  export type Right<R> = Monad.Right<R>;
  export function Right<R>(val: R): Right<R> {
    return new Monad.Right<R>(val);
  }
}

export type Either<L, R> = Monad.Either<L, R>;
export type Left<L> = Either.Left<L>;
export const Left = Either.Left;
export type Right<R> = Either.Right<R>;
export const Right = Either.Right;
export const Return = Either.Return;
