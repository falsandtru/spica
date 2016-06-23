import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public static mplus<T>(a: Sequence<T, any>, b: Sequence<T, any>): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]> {
    return Sequence.mconcat([a, b]);
  }
}
