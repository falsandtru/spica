import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public takeUntil(f: (p: T) => boolean): Sequence<T, Sequence.Iterator<T>> {
    return new Sequence<T, Sequence.Iterator<T>>((iter = () => this.iterate(), cons) =>
      Sequence.Iterator.when(
        iter(),
        () => cons(),
        thunk =>
          f(Sequence.Thunk.value(thunk))
            ? cons(Sequence.Thunk.value(thunk))
            : cons(Sequence.Thunk.value(thunk), Sequence.Thunk.iterator(thunk))));
  }
}
