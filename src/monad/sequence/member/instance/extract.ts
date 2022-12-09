import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public override extract(): a[] {
    const acc: a[] = [];
    let iter = () => this.iterate();
    for (; ;) {
      const thunk = iter();
      if (!Sequence.isIterable(thunk)) return acc;
      acc.push(Sequence.Thunk.value(thunk));
      iter = Sequence.Thunk.iterator(thunk);
    }
  }
});
