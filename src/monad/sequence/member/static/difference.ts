import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public static override difference<a>(a: Sequence<a, unknown>, b: Sequence<a, unknown>, cmp: (a: a, b: a) => number): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]> {
    return new Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>(([ai, bi] = [() => a.iterate(), () => b.iterate()], cons) =>
      Sequence.Iterator.when(
        ai(),
        () =>
          Sequence.Iterator.when(
            bi(),
            () => cons(),
            bt => cons(Sequence.Thunk.value(bt), [Sequence.Iterator.done, Sequence.Thunk.iterator(bt)])),
        (at, ar) =>
          Sequence.Iterator.when(
            bi(),
            () => cons(Sequence.Thunk.value(at), [Sequence.Thunk.iterator(at), Sequence.Iterator.done]),
            bt => {
              const ord = cmp(Sequence.Thunk.value(at), Sequence.Thunk.value(bt));
              if (ord < 0) return cons(Sequence.Thunk.value(at), [Sequence.Thunk.iterator(at), () => bt]);
              if (ord > 0) return cons(Sequence.Thunk.value(bt), [() => at, Sequence.Thunk.iterator(bt)]);
              return bi = () => Sequence.Thunk.iterator(bt)(), ar();
            })));
  }
});
