import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public static override resume<a>(iterator: Sequence.Iterator<a>): Sequence<a, Sequence.Iterator<a>> {
    return new Sequence<a, Sequence.Iterator<a>>((iter = iterator, cons) =>
      Sequence.Iterator.when(
        iter(),
        () => cons(),
        thunk => cons(Sequence.Thunk.value(thunk), Sequence.Thunk.iterator(thunk))));
  }
});
