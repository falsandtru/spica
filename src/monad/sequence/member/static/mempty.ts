import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public static mempty: Sequence<never, never> = new Sequence((_, cons) => cons());
});
