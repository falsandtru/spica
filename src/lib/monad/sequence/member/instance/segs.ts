import {Sequence} from '../../core';
import {concat} from '../../../../concat';

export default class <a, z> extends Sequence<a, z> {
  public segs(): Sequence<a[], [Sequence.Iterator<a[]>, Sequence.Iterator<a[]>]> {
    return Sequence.mappend(
      this
        .fold<Sequence<a[], any>>((a, bs) =>
          bs.take(1)
            .bind(b =>
              Sequence.mappend(
                Sequence.from([
                  Sequence.mappend(
                    Sequence.from([[a]]),
                    Sequence.from(b).map(c => concat([a], c)))
                ]),
                bs))
        , Sequence.from([Sequence.from([])]))
        .bind(a => a),
      Sequence.from([[]]));
  }
}
