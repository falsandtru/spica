import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public fmap<b>(f: (a: a) => b): Sequence<b, Sequence.Iterator<a>> {
    return new Sequence<b, Sequence.Iterator<a>>((iter = () => this.iterate()) =>
      Sequence.Iterator.when(
        iter(),
        () => Sequence.Data.cons<b, Sequence.Iterator<a>>(),
        thunk => Sequence.Data.cons<b, Sequence.Iterator<a>>(f(Sequence.Thunk.value(thunk)), Sequence.Thunk.iterator(thunk))));
  }
}
