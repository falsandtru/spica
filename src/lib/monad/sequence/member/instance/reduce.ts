import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public reduce(): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]> {
    return new Sequence<a, [number, Map<number, Sequence.Thunk<a>>]>(
      ([i, memo] = [0, new Map<number, Sequence.Thunk<a>>()], cons) =>
        Sequence.Iterator.when(
          memo.get(i) || memo.set(i, i > 0 && memo.has(i - 1) ? Sequence.Thunk.iterator(memo.get(i - 1)!)() : this.iterate()).get(i)!,
          () => cons(),
          thunk => cons(Sequence.Thunk.value(thunk), [i + 1, memo])));
  }
}
