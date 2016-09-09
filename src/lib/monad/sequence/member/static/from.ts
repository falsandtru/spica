import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static from<a>(as: Iterable<a>): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]> {
    return new Sequence<a, [Iterator<a>, number]>(
      ([iter, i] = [as[Symbol.iterator](), 0], cons) => {
        const result = iter.next();
        return result.done
          ? cons()
          : cons(result.value, [iter, i + 1]);
      })
      .reduce();
  }
}
