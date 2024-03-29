import { floor, random } from '../../../../alias';
import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public static override random(): Sequence<number, [number, Map<number, Sequence.Thunk<number>>]>
  public static override random<a>(gen: () => a): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]>
  public static override random<a>(as: a[]): Sequence<a, Sequence.Iterator<number>>
  public static override random<a>(p: (() => number) | (() => a) | a[] = () => random()): Sequence<number | a, [number, Map<number, Sequence.Thunk<number | a>>]> | Sequence<a, Sequence.Iterator<number>> {
    return typeof p === 'function'
      ? Sequence.from(new Sequence<number | a, undefined>((_, cons) => cons(p(), _)))
      : this.random().map(r => p[floor(r * p.length)]);
  }
});
