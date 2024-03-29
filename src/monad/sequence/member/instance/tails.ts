import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public override tails(): Sequence<a[], [Sequence.Iterator<a[]>, Sequence.Iterator<a[]>]> {
    return Sequence.mappend(
      Sequence.from(this.extract().map((_, i, as) => as.slice(i))),
      Sequence.from([[]]));
  }
});
