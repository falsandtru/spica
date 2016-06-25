import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static random(): Sequence<number, number>
  public static random<a>(gen: () => a): Sequence<a, number>
  public static random<a>(as: a[]): Sequence<a, Sequence.Iterator<number>>
  public static random<a>(p: (() => number) | (() => a) | a[] = () => Math.random()): Sequence<number, number> | Sequence<a, number> | Sequence<a, Sequence.Iterator<number>> {
    switch (true) {
      case Array.isArray(p):
        return this.random()
          .map(r => p[r * p.length | 0]);
      default:
        return new Sequence<a, number>((_, cons) => cons((<() => a>p)(), NaN));
    }
  }
}
