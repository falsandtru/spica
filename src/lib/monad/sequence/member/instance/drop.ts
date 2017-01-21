import { Sequence } from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public drop(n: number): Sequence<a, Sequence.Iterator<a>> {
    return new Sequence<a, Sequence.Iterator<a>>((iter = () => this.iterate(), cons) =>
      Sequence.Iterator.when(
        iter(),
        () => cons(),
        (thunk, recur) =>
          Sequence.Thunk.index(thunk) < n
            ? recur()
            : cons(Sequence.Thunk.value(thunk), Sequence.Thunk.iterator(thunk))));
  }
}
