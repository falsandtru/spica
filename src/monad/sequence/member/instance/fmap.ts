import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public fmap<b>(f: (a: a) => b): Sequence<b, Sequence.Iterator<a>> {
    return new Sequence<b, Sequence.Iterator<a>>((iter = () => this.iterate()) =>
      Sequence.Iterator.when<a, Sequence.Data<b, Sequence.Iterator<a>>>(
        iter(),
        () => Sequence.Data.cons(),
        thunk => Sequence.Data.cons(f(Sequence.Thunk.value(thunk)), Sequence.Thunk.iterator(thunk))));
  }
});
