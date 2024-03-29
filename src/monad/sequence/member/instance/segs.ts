import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public override segs(): Sequence<a[], [Sequence.Iterator<a[]>, Sequence.Iterator<a[]>]> {
    return Sequence.mappend(
      this
        .foldr<Sequence<a[], unknown>>((a, bs) =>
          bs.take(1)
            .bind(b =>
              Sequence.mappend(
                Sequence.from([
                  Sequence.mappend(
                    Sequence.from([[a]]),
                    Sequence.from(b).map(c => [a, ...c]))
                ]),
                bs))
        , Sequence.from([Sequence.from([])]))
        .bind(a => a),
      Sequence.from([[]]));
  }
});
