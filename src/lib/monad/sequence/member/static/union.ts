import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static union<a>(cmp: (a: a, b: a) => number, as: Sequence<a, any>[]): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]> {
    return as.reduce((a, b) => union(cmp, a, b));
  }
}

function union<a>(cmp: (a: a, b: a) => number, a: Sequence<a, any>, b: Sequence<a, any>): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]> {
  return new Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>(([ai, bi] = [() => a.iterate(), () => b.iterate()], cons) =>
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
