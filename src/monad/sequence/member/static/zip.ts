import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public static override zip<a, b>(a: Sequence<a, unknown>, b: Sequence<b, unknown>): Sequence<[a, b], [Sequence.Iterator<a>, Sequence.Iterator<b>]> {
    return new Sequence<[a, b], [Sequence.Iterator<a>, Sequence.Iterator<b>]>(([ai, bi] = [() => a.iterate(), () => b.iterate()], cons) =>
      Sequence.Iterator.when(
        ai(),
        () => cons(),
        at =>
          Sequence.Iterator.when(
            bi(),
            () => cons(),
            bt => cons([Sequence.Thunk.value(at), Sequence.Thunk.value(bt)], [Sequence.Thunk.iterator(at), Sequence.Thunk.iterator(bt)]))));
  }
});
