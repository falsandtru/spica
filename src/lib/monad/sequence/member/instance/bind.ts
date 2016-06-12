import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public bind<U>(f: (p: T) => Sequence<U, any>): Sequence<U, [Sequence.Iterator<T>, Sequence.Iterator<U>]> {
    return new Sequence<U, [Sequence.Iterator<T>, Sequence.Iterator<U>]>(([ai, bi] = [() => this.iterate(), Sequence.Iterator.done], cons) =>
      Sequence.Iterator.when(
        ai(),
        () => cons(),
        (at, recur) => {
          bi = bi === Sequence.Iterator.done
            ? () => f(Sequence.Thunk.value(at)).iterate()
            : bi;
          return Sequence.Iterator.when(
            bi(),
            () => (bi = Sequence.Iterator.done, recur()),
            bt => cons(Sequence.Thunk.value(bt), [() => at, Sequence.Thunk.iterator(bt)]));
        }));
  }
}
