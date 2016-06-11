import {Sequence} from '../../core';
import {compose} from '../../../../compose';

export default class <T, S> extends Sequence<T, S> {
  public drop(n: number): Sequence<T, Sequence.Iterator<T>> {
    return this.dropWhile((_, i) => i < n);
  }
}
