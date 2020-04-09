import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public group(f: (x: a, y: a) => boolean): Sequence<a[], [Sequence.Iterator<a>, a[]]> {
    return new Sequence<a[], [Sequence.Iterator<a>, a[]]>(([iter, acc] = [() => this.iterate(), []], cons) =>
      Sequence.Iterator.when(
        iter(),
        () =>
          acc.length === 0
            ? cons()
            : cons(acc),
        (thunk, recur) =>
          acc.length === 0 || f(acc[0], Sequence.Thunk.value(thunk))
            ? (acc.push(Sequence.Thunk.value(thunk)), recur())
            : cons(acc, [Sequence.Thunk.iterator(thunk), [Sequence.Thunk.value(thunk)]])));
  }
});
