import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static intersect<a>(as: Sequence<a, any>[], cmp: (l: a, r: a) => number): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]> {
    return as.reduce((a, b) => intersect(a, b, cmp));
  }
}

function intersect<a>(a: Sequence<a, any>, b: Sequence<a, any>, cmp: (l: a, r: a) => number): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]> {
  return new Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>(([ai, bi] = [() => a.iterate(), () => b.iterate()], cons) =>
    Sequence.Iterator.when(
      ai(),
      () => cons(),
      (at, ar) =>
        Sequence.Iterator.when(
          bi(),
          () => cons(),
          (bt, br) => {
            const result = cmp(Sequence.Thunk.value(at), Sequence.Thunk.value(bt));
            if (result < 0) return bi = () => bt, ar();
            if (result > 0) return br();
            return cons(Sequence.Thunk.value(at), [Sequence.Thunk.iterator(at), Sequence.Thunk.iterator(bt)]);
          })));
}
