import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public scan<U>(f: (b: U, a: T) => U, z: U): Sequence<U, [U, Sequence.Iterator<T>]> {
    return new Sequence<U, [U, Sequence.Iterator<T>]>(([prev = z, iter = () => this.iterate()] = [void 0, void 0]) =>
      Sequence.Iterator.when(
        iter(),
        () => Sequence.cons<U, [U, Sequence.Iterator<T>]>(),
        thunk =>
          Sequence.cons<U, [U, Sequence.Iterator<T>]>(
            prev = f(prev, Sequence.Thunk.value(thunk)),
            [prev, Sequence.Thunk.iterator(thunk)])));
  }
}
