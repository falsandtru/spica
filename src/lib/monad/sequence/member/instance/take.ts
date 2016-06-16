import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public take(n: number): Sequence<T, Sequence.Iterator<T>> {
    return new Sequence<T, Sequence.Iterator<T>>((iter = () => this.iterate(), cons) =>
      Sequence.Iterator.when(
        iter(),
        () => cons(),
        thunk =>
          Sequence.Thunk.index(thunk) < n
            ? cons(Sequence.Thunk.value(thunk), Sequence.Thunk.iterator(thunk))
            : cons()));
  }
}
