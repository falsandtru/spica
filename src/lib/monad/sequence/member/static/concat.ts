import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public static concat<T>(as: Sequence<Sequence<T, any>, any>): Sequence<T, [Sequence.Iterator<Sequence<T, any>>, Sequence.Iterator<T>]> {
    return new Sequence<T, [Sequence.Iterator<Sequence<T, any>>, Sequence.Iterator<T>]>(([ai, bi] = [() => as.iterate(), Sequence.Iterator.done], cons) =>
      Sequence.Iterator.when(
        ai(),
        () => cons(),
        (at, recur) => (
          bi = bi === Sequence.Iterator.done
            ? () => Sequence.Thunk.value(at).iterate()
            : bi,
          Sequence.Iterator.when(
            bi(),
            () => (bi = Sequence.Iterator.done, recur()),
            bt => cons(Sequence.Thunk.value(bt), [() => at, Sequence.Thunk.iterator(bt)])))));
  }
}
