import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static random(): Sequence<number, [number, Map<number, Sequence.Thunk<number>>]>
  public static random<a>(gen: () => a): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]>
  public static random<a>(as: a[]): Sequence<a, Sequence.Iterator<number>>
  public static random<a>(p: (() => number) | (() => a) | a[] = () => Math.random()): Sequence<number | a, [number, Map<number, Sequence.Thunk<number | a>>]> | Sequence<a, Sequence.Iterator<number>> {
    return typeof p === 'function'
      ? Sequence.from(new Sequence<number | a, void>((_, cons) => cons(p(), _)))
      : this.random().map(r => p[r * p.length | 0]);
  }
}
