import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public override subsequences(): Sequence<a[], [Sequence.Iterator<a[]>, Sequence.Iterator<a[]>]> {
    return Sequence.mappend<a[]>(
      Sequence.from([[]]),
      Sequence.from([0])
        .bind(() =>
          nonEmptySubsequences(this)));
  }
});

function nonEmptySubsequences<a, z>(xs: Sequence<a, z>): Sequence<a[], [Sequence.Iterator<a[]>, Sequence.Iterator<a[]>]> {
  return Sequence.Iterator.when<a, Sequence<a[], [Sequence.Iterator<a[]>, Sequence.Iterator<a[]>]>>(
    xs.iterate(),
    () => Sequence.mempty,
    xt =>
      Sequence.mappend<a[]>(
        Sequence.from([[Sequence.Thunk.value(xt)]]),
        new Sequence<Sequence<a[], [Sequence.Iterator<Sequence<a[], unknown>>, Sequence.Iterator<a[]>]>, undefined>((_, cons) =>
          Sequence.Iterator.when(
            xt,
            () => cons(),
            xt =>
              cons(
                nonEmptySubsequences(
                  Sequence.resume(Sequence.Thunk.iterator(xt)))
                  .foldr<a[]>((ys, r) =>
                    Sequence.mappend(
                      Sequence.mappend(
                        Sequence.from([ys]),
                        Sequence.from([[Sequence.Thunk.value(xt), ...ys]])),
                      r)
                  , Sequence.mempty))))
          .bind(xs => xs)));
}
