import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public override unique(): Sequence<a, Sequence.Iterator<a>> {
    const memory = new Set<a>();
    return this.filter(a =>
      !memory.has(a) && !!memory.add(a));
  }
});
