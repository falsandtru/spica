import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public static override mconcat<a>(as: Iterable<Sequence<a, unknown>>): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]> {
    return [...as]
      .reduce<Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>>((a, b) => mconcat(a, b), Sequence.mempty);
  }
});

function mconcat<a>(a: Sequence<a, unknown>, b: Sequence<a, unknown>): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]> {
  return new Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>(([ai, bi] = [() => a.iterate(), () => b.iterate()], cons) =>
    Sequence.Iterator.when(
      ai(),
      () =>
        Sequence.Iterator.when(
          bi(),
          () => cons(),
          bt => cons(Sequence.Thunk.value(bt), [Sequence.Iterator.done, Sequence.Thunk.iterator(bt)])),
      at => cons(Sequence.Thunk.value(at), [Sequence.Thunk.iterator(at), bi])));
}
