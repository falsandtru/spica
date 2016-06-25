import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public dropWhile(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>> {
    return new Sequence<a, Sequence.Iterator<a>>((iter = () => this.iterate(), cons) =>
      Sequence.Iterator.when(
        iter(),
        () => cons(),
        (thunk, recur) =>
          f(Sequence.Thunk.value(thunk))
            ? recur()
            : cons(Sequence.Thunk.value(thunk), Sequence.Thunk.iterator(thunk))));
  }
}
