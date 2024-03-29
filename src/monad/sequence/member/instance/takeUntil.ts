import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public override takeUntil(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>> {
    return new Sequence<a, Sequence.Iterator<a>>((iter = () => this.iterate(), cons) =>
      Sequence.Iterator.when(
        iter(),
        () => cons(),
        thunk =>
          f(Sequence.Thunk.value(thunk))
            ? cons(Sequence.Thunk.value(thunk))
            : cons(Sequence.Thunk.value(thunk), Sequence.Thunk.iterator(thunk))));
  }
});
