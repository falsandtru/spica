import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public take(n: number): Sequence<T, Sequence.Iterator<T>> {
    return new Sequence<T, Sequence.Iterator<T>>((iter = () => this.iterate(), cons) =>
      Sequence.Iterator.when(
        n > 0 ? iter() : <Sequence.Thunk<T>>Sequence.Iterator.done(),
        () => cons(),
        thunk =>
          Sequence.Thunk.index(thunk) + 1 < n
            ? cons(Sequence.Thunk.value(thunk), Sequence.Thunk.iterator(thunk))
            : cons(Sequence.Thunk.value(thunk))));
  }
}
