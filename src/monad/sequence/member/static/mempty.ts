import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public static override mempty: Sequence<never, never> = new Sequence((_, cons) => cons());
});
