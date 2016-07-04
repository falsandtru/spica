import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static concat<a>(as: Sequence<Sequence<a, any>, any>): Sequence<a, [Sequence.Iterator<Sequence<a, any>>, Sequence.Iterator<a>]> {
    return new Sequence<a, [Sequence.Iterator<Sequence<a, any>>, Sequence.Iterator<a>]>(([ai, bi] = [() => as.iterate(), Sequence.Iterator.done], cons) =>
      Sequence.Iterator.when(
        ai(),
        () => cons(),
        (at, ar) => (
          bi = bi === Sequence.Iterator.done
            ? () => Sequence.Thunk.value(at).iterate()
            : bi,
          Sequence.Iterator.when(
            bi(),
            () => (bi = Sequence.Iterator.done, ar()),
            bt => cons(Sequence.Thunk.value(bt), [() => at, Sequence.Thunk.iterator(bt)])))));
  }
}
