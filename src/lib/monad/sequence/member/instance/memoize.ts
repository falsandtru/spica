import {Sequence} from '../../core';
import {compose} from '../../../../compose';

export default class <T, S> extends Sequence<T, S> {
  public memoize(memory: Map<number, Sequence.Data<T, S>> = this.memory || new Map<number, Sequence.Data<T, S>>()): Sequence<T, S> {
    return new Sequence<T, S>(this.cons, this.memory || memory);
  }
}
