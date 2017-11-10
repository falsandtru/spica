import { Sequence } from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public scanl<b>(f: (b: b, a: a) => b, z: b): Sequence<b, [b, Sequence.Iterator<a>, number]> {
    return new Sequence<b, [b, Sequence.Iterator<a>, number]>(([prev, iter, i] = [z, () => this.iterate(), 0]) =>
      Sequence.Iterator.when<a, Sequence.Data<b, [b, Sequence.Iterator<a>, number]>>(
        iter(),
        () =>
          i === 0
            ? Sequence.Data.cons(z)
            : Sequence.Data.cons(),
        thunk =>
          Sequence.Data.cons<b, [b, Sequence.Iterator<a>, number]>(
            prev = f(prev, Sequence.Thunk.value(thunk)),
            [prev, Sequence.Thunk.iterator(thunk), Sequence.Thunk.index(thunk) + 1])));
  }
}
