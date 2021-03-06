import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public extract(): a[] {
    const acc: a[] = [];
    let iter = () => this.iterate();
    while (true) {
      const thunk = iter();
      if (!Sequence.isIterable(thunk)) return acc;
      void acc.push(Sequence.Thunk.value(thunk));
      iter = Sequence.Thunk.iterator(thunk);
    }
  }
});
