import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public static override Return<a>(a: a): Sequence<a, number> {
    return new Sequence<a, number>((_, cons) => cons(a));
  }
});
