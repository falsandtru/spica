import {Sequence} from '../../core';
import {compose} from '../../../../compose';

export default class <T, S> extends Sequence<T, S> {
  public filter(f: (p: T, i: number) => boolean): Sequence<T, Sequence.Iterator<T>> {
    return new Sequence<T, Sequence.Iterator<T>>((iter = () => this.iterate(), cons) =>
      Sequence.Iterator.when(
        iter(),
        () => cons(),
        (thunk, recur) =>
          f(Sequence.Thunk.value(thunk), Sequence.Thunk.index(thunk))
            ? cons(Sequence.Thunk.value(thunk), Sequence.Thunk.iterator(thunk))
            : recur()));
  }
}
