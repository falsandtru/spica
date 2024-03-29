import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';
import { memoize } from '../../../../memoize';

const memory = memoize(<a>(_: Sequence<a, unknown>): Map<number, Sequence.Thunk<a>> => new Map());

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public override memoize(): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]> {
    return new Sequence<a, [number, Map<number, Sequence.Thunk<a>>]>(
      ([i, memo] = [0, memory(this)], cons) =>
        Sequence.Iterator.when(
          memo.get(i) || memo.set(i, i > 0 && memo.has(i - 1) ? Sequence.Thunk.iterator(memo.get(i - 1)!)() : this.iterate()).get(i)!,
          () => cons(),
          thunk => cons(Sequence.Thunk.value(thunk), [i + 1, memo])));
  }
});
