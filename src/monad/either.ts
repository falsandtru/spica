import * as Monad from './either.impl';
import { noop } from '../function';

export class Either<a, b> extends Monad.Either<a, b> {
  private constructor() {
    super(noop as never);
  }
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
