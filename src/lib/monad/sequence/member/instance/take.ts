import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public take(n: number): Sequence<a, Sequence.Iterator<a>> {
    return new Sequence<a, Sequence.Iterator<a>>((iter = () => this.iterate(), cons) =>
      Sequence.Iterator.when(
        n > 0 ? iter() : <Sequence.Thunk<a>>Sequence.Iterator.done(),
        () => cons(),
        thunk =>
          Sequence.Thunk.index(thunk) + 1 < n
            ? cons(Sequence.Thunk.value(thunk), Sequence.Thunk.iterator(thunk))
            : cons(Sequence.Thunk.value(thunk))));
  }
}
