import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public fmap<U>(f: (p: T) => U): Sequence<U, Sequence.Iterator<T>> {
    return new Sequence<U, Sequence.Iterator<T>>((iter = () => this.iterate()) =>
      Sequence.Iterator.when(
        iter(),
        () => Sequence.Data.cons<U, Sequence.Iterator<T>>(),
        thunk => Sequence.Data.cons<U, Sequence.Iterator<T>>(f(Sequence.Thunk.value(thunk)), Sequence.Thunk.iterator(thunk))));
  }
}
