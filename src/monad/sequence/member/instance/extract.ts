import { Sequence } from '../../core';
import { concat } from '../../../../concat';

export default class <a, z> extends Sequence<a, z> {
  public extract(): a[] {
    const acc: a[] = [];
    let iter = () => this.iterate();
    while (true) {
      const thunk = iter();
      if (!Sequence.isIterable(thunk)) return acc;
      void concat(acc, [Sequence.Thunk.value(thunk)]);
      iter = Sequence.Thunk.iterator(thunk);
    }
  }
}
