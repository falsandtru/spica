import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static union<a>(a: Sequence<a, any>, b: Sequence<a, any>, cmp: (a: a, b: a) => number): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]> {
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
              const ord = cmp(Sequence.Thunk.value(at), Sequence.Thunk.value(bt));
              if (ord < 0) return cons(Sequence.Thunk.value(at), [Sequence.Thunk.iterator(at), bi]);
              if (ord > 0) return cons(Sequence.Thunk.value(bt), [ai, Sequence.Thunk.iterator(bt)]);
              return cons(Sequence.Thunk.value(at), [Sequence.Thunk.iterator(at), Sequence.Thunk.iterator(bt)]);
            })));
  }
}
