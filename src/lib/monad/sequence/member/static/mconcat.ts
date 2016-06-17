import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public static mconcat<T>(ss: Sequence<T, any>[]): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]> {
    return ss.reduce((a, b) => concat(a, b), Sequence.from([]));
  }
}

function concat<T>(a: Sequence<T, any>, b: Sequence<T, any>): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]> {
  return new Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]>(([ai, bi] = [() => a.iterate(), () => b.iterate()], cons) =>
    Sequence.Iterator.when(
      ai(),
      () =>
        Sequence.Iterator.when(
          bi(),
          () => cons(),
          bt => cons(Sequence.Thunk.value(bt), [Sequence.Iterator.done, Sequence.Thunk.iterator(bt)])),
      at => cons(Sequence.Thunk.value(at), [Sequence.Thunk.iterator(at), bi])));
}
