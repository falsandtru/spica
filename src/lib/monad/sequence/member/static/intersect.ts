import {Sequence} from '../../core';
import {compose} from '../../../../compose';

export default class <T, S> extends Sequence<T, S> {
  public static intersect<T>(cmp: (a: T, b: T) => number, ss: Sequence<T, any>[]): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]> {
    return ss.reduce((a, b) => intersect(cmp, a, b));

    function intersect<T>(cmp: (a: T, b: T) => number, a: Sequence<T, any>, b: Sequence<T, any>): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]> {
      return new Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]>(([ai, bi] = [() => a.iterate(), () => b.iterate()], cons) =>
        Sequence.Iterator.when(
          ai(),
          () => cons(),
          (at, ar) =>
            Sequence.Iterator.when(
              bi(),
              () => cons(),
              (bt, br) => {
                const result = cmp(Sequence.Thunk.value(at), Sequence.Thunk.value(bt));
                if (result < 0) return bi = () => bt, ar();
                if (result > 0) return br();
                return cons(Sequence.Thunk.value(at), [Sequence.Thunk.iterator(at), Sequence.Thunk.iterator(bt)]);
              })));
    }
  }
}
