import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public take(n: number): Sequence<T, Sequence.Iterator<T>> {
    return this.takeWhile((_, i) => i < n);
  }
}
