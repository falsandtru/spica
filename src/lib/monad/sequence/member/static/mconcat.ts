import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static mconcat<a>(as: Sequence<a, any>[]): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]> {
    return as.reduce((a, b) => mconcat(a, b), Sequence.mempty);
  }
}

function mconcat<a>(a: Sequence<a, any>, b: Sequence<a, any>): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]> {
  return new Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>(([ai, bi] = [() => a.iterate(), () => b.iterate()], cons) =>
    Sequence.Iterator.when(
      ai(),
      () =>
        Sequence.Iterator.when(
          bi(),
          () => cons(),
          bt => cons(Sequence.Thunk.value(bt), [Sequence.Iterator.done, Sequence.Thunk.iterator(bt)])),
      at => cons(Sequence.Thunk.value(at), [Sequence.Thunk.iterator(at), bi])));
}
