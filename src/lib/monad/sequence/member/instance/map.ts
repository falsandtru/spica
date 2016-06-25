import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public map<b>(f: (a: a, i: number) => b): Sequence<b, Sequence.Iterator<a>> {
    return new Sequence<b, Sequence.Iterator<a>>((iter = () => this.iterate()) =>
      Sequence.Iterator.when(
        iter(),
        () => Sequence.Data.cons<b, Sequence.Iterator<a>>(),
        thunk => Sequence.Data.cons<b, Sequence.Iterator<a>>(f(Sequence.Thunk.value(thunk), Sequence.Thunk.index(thunk)), Sequence.Thunk.iterator(thunk))));
  }
}
