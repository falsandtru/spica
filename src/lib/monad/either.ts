import {Either as Either_, Left as Left_, Right as Right_} from './either.impl';

export namespace Either {
  export type Left<L> = Left_<L>;
  export function Left<L>(val: L): Left<L> {
    return new Left_<L>(val);
  }
  export type Right<R> = Right_<R>;
  export function Right<R>(val: R): Right<R> {
    return new Right_<R>(val);
  }
  export const Return = Right;
}

export type Either<L, R> = Left<L> | Right<R> | Either_<L, R>;
export type Left<L> = Either.Left<L>;
export const Left = Either.Left;
export type Right<R> = Either.Right<R>;
export const Right = Either.Right;
export const Return = Either.Return;
