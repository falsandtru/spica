import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public scan<b>(f: (b: b, a: a) => b, z: b): Sequence<b, [b, Sequence.Iterator<a>]> {
    return new Sequence<b, [b, Sequence.Iterator<a>]>(([prev = z, iter = () => this.iterate()] = [void 0, void 0]) =>
      Sequence.Iterator.when(
        iter(),
        () => Sequence.Data.cons<b, [b, Sequence.Iterator<a>]>(),
        thunk =>
          Sequence.Data.cons<b, [b, Sequence.Iterator<a>]>(
            prev = f(prev, Sequence.Thunk.value(thunk)),
            [prev, Sequence.Thunk.iterator(thunk)])));
  }
}
