import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public static union<T>(cmp: (a: T, b: T) => number, ss: Sequence<T, any>[]): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]> {
    return ss.reduce((a, b) => union(cmp, a, b));
  }
}

function union<T>(cmp: (a: T, b: T) => number, a: Sequence<T, any>, b: Sequence<T, any>): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]> {
  return new Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]>(([ai, bi] = [() => a.iterate(), () => b.iterate()], cons) =>
    Sequence.Iterator.when(
      ai(),
      () =>
        Sequence.Iterator.when(
          bi(),
          () => cons(),
          bt => cons(Sequence.Thunk.value(bt), [Sequence.Iterator.done, Sequence.Thunk.iterator(bt)])),
      at =>
        Sequence.Iterator.when(
          bi(),
          () => cons(Sequence.Thunk.value(at), [Sequence.Thunk.iterator(at), Sequence.Iterator.done]),
          bt => {
            const result = cmp(Sequence.Thunk.value(at), Sequence.Thunk.value(bt));
            if (result < 0) return cons(Sequence.Thunk.value(at), [Sequence.Thunk.iterator(at), bi]);
            if (result > 0) return cons(Sequence.Thunk.value(bt), [ai, Sequence.Thunk.iterator(bt)]);
            return cons(Sequence.Thunk.value(at), [Sequence.Thunk.iterator(at), Sequence.Thunk.iterator(bt)]);
          })));
}
