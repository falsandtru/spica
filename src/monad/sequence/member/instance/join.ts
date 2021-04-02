import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public override join<b>(this: Sequence<Sequence<b, unknown>, unknown>): Sequence<b, [Sequence.Iterator<Sequence<b, unknown>>, Sequence.Iterator<b>]> {
    return Sequence.concat(this);
  }
});
