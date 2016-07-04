import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public scan<b>(f: (b: b, a: a) => b, z: b): Sequence<b, [b, Sequence.Iterator<a>, number]> {
    return new Sequence<b, [b, Sequence.Iterator<a>, number]>(([prev = z, iter = () => this.iterate(), i = 0] = [void 0, void 0, void 0]) =>
      Sequence.Iterator.when(
        iter(),
        thunk =>
          i === 0
            ? Sequence.Data.cons<b, [b, Sequence.Iterator<a>, number]>(z)
            : Sequence.Data.cons<b, [b, Sequence.Iterator<a>, number]>(),
        thunk =>
          Sequence.Data.cons<b, [b, Sequence.Iterator<a>, number]>(
            prev = f(prev, Sequence.Thunk.value(thunk)),
            [prev, Sequence.Thunk.iterator(thunk), Sequence.Thunk.index(thunk) + 1])));
  }
}
