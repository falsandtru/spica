import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public sort(cmp?: (a: a, b: a) => number): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]> {
    return Sequence.from(this.extract().sort(cmp));
  }
});
