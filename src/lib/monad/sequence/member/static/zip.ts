import {Sequence} from '../../core';
import {compose} from '../../../../compose';

export default class <T, S> extends Sequence<T, S> {
  public static zip<T, U>(a: Sequence<T, any>, b: Sequence<U, any>): Sequence<[T, U], [Sequence.Iterator<T>, Sequence.Iterator<U>]> {
    return new Sequence<[T, U], [Sequence.Iterator<T>, Sequence.Iterator<U>]>(([ai, bi] = [() => a.iterate(), () => b.iterate()], cons) =>
      Sequence.Iterator.when(
        ai(),
        () => cons(),
        at =>
          Sequence.Iterator.when(
            bi(),
            () => cons(),
            bt => cons([Sequence.Thunk.value(at), Sequence.Thunk.value(bt)], [Sequence.Thunk.iterator(at), Sequence.Thunk.iterator(bt)]))));
  }
}
