import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public static override intersect<a>(a: Sequence<a, unknown>, b: Sequence<a, unknown>, cmp: (l: a, r: a) => number): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]> {
    return new Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>(([ai, bi] = [() => a.iterate(), () => b.iterate()], cons) =>
      Sequence.Iterator.when(
        ai(),
        () => cons(),
        (at, ar) =>
          Sequence.Iterator.when(
            bi(),
            () => cons(),
            (bt, br) => {
              const ord = cmp(Sequence.Thunk.value(at), Sequence.Thunk.value(bt));
              if (ord < 0) return bi = () => bt, ar();
              if (ord > 0) return br();
              return cons(Sequence.Thunk.value(at), [Sequence.Thunk.iterator(at), Sequence.Thunk.iterator(bt)]);
            })));
  }
});
