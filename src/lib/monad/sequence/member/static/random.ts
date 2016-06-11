import {Sequence} from '../../core';
import {compose} from '../../../../compose';

export default class <T, S> extends Sequence<T, S> {
  public static random(): Sequence<number, number>
  public static random<T>(gen: () => T): Sequence<T, number>
  public static random<T>(as: T[]): Sequence<T, Sequence.Iterator<number>>
  public static random<T>(p: (() => number) | (() => T) | T[] = () => Math.random()): Sequence<number, number> | Sequence<T, number> | Sequence<T, Sequence.Iterator<number>> {
    switch (true) {
      case Array.isArray(p):
        return this.random()
          .map(r => p[r * p.length | 0]);
      default:
        return new Sequence<T, number>((_, cons) => cons((<() => T>p)(), NaN));
    }
  }
}
