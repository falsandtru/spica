import {Sequence} from '../../core';
import {compose} from '../../../../compose';

export default class <T, S> extends Sequence<T, S> {
  public map<U>(f: (p: T, i: number) => U): Sequence<U, Sequence.Iterator<T>> {
    return new Sequence<U, Sequence.Iterator<T>>((iter = () => this.iterate()) =>
      Sequence.Iterator.when(
        iter(),
        () => Sequence.cons<U, Sequence.Iterator<T>>(),
        thunk => Sequence.cons<U, Sequence.Iterator<T>>(f(Sequence.Thunk.value(thunk), Sequence.Thunk.index(thunk)), Sequence.Thunk.iterator(thunk))));
  }
}
