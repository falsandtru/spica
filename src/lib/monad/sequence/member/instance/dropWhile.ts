import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public dropWhile(f: (p: T) => boolean): Sequence<T, Sequence.Iterator<T>> {
    return new Sequence<T, Sequence.Iterator<T>>((iter = () => this.iterate(), cons) =>
      Sequence.Iterator.when(
        iter(),
        () => cons(),
        (thunk, recur) =>
          f(Sequence.Thunk.value(thunk))
            ? recur()
            : cons(Sequence.Thunk.value(thunk), Sequence.Thunk.iterator(thunk))));
  }
}
