import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static random(): Sequence<number, [Iterator<number>, number, Map<number, IteratorResult<number>>]>
  public static random<a>(gen: () => a): Sequence<a, [Iterator<a>, number, Map<number, IteratorResult<a>>]>
  public static random<a>(as: a[]): Sequence<a, Sequence.Iterator<number>>
  public static random<a>(p: (() => number) | (() => a) | a[] = () => Math.random()): Sequence<number | a, [Iterator<number | a>, number, Map<number, IteratorResult<number | a>>]> | Sequence<a, Sequence.Iterator<number>> {
    return typeof p === 'function'
      ? Sequence.from(new Sequence<number | a, void>((_, cons) => cons(p(), _)))
      : this.random().map(r => p[r * p.length | 0]);
  }
}
