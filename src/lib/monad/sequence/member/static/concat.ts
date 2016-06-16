import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public static concat<T>(ss: Sequence<T, any>[]): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]>
  public static concat<T>(ss: Sequence<Sequence<T, any>, any>): Sequence<T, [Sequence.Iterator<T[]>, Sequence.Iterator<T>]>
  public static concat<T>(ss: Sequence<T[], any>): Sequence<T, [Sequence.Iterator<T[]>, Sequence.Iterator<T>]>
  public static concat<T>(ss: Sequence<T, any>[] | Sequence<Sequence<T, any>, any> | Sequence<T[], any>): Sequence<T, [Sequence.Iterator<T> | Sequence.Iterator<T[]>, Sequence.Iterator<T>]> {
    return Array.isArray(ss)
      ? ss.reduce((a, b) => concat(a, b), Sequence.from([]))
      : (<Sequence<T[], any>>ss).bind((s: Sequence<T, any> | T[]) =>
        Array.isArray(s)
          ? Sequence.from(s)
          : s);
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
