import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public static override mappend<a>(l: Sequence<a, unknown>, r: Sequence<a, unknown>): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]> {
    return Sequence.mconcat([l, r]);
  }
});
