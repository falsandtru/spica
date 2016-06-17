import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public static concat<T>(ss: Sequence<T, any>[]): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]>
  public static concat<T>(ss: Sequence<Sequence<T, any>, any>): Sequence<T, [Sequence.Iterator<T[]>, Sequence.Iterator<T>]>
  public static concat<T>(ss: Sequence<T[], any>): Sequence<T, [Sequence.Iterator<T[]>, Sequence.Iterator<T>]>
  public static concat<T>(ss: Sequence<T, any>[] | Sequence<Sequence<T, any>, any> | Sequence<T[], any>): Sequence<T, [Sequence.Iterator<T> | Sequence.Iterator<T[]>, Sequence.Iterator<T>]> {
    return Array.isArray(ss)
      ? Sequence.mconcat(ss)
      : (<Sequence<T[], any>>ss).bind((s: Sequence<T, any> | T[]) =>
        Array.isArray(s)
          ? Sequence.from(s)
          : s);
  }
}
