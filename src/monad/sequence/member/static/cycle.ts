import { Sequence } from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static cycle<a>(as: Iterable<a>): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]> {
    return new Sequence<a, [Iterator<a>, number]>(
      function cycle(
        [iter, i] = [as[Symbol.iterator](), 0],
        cons,
      ): Sequence.Data<a, [Iterator<a>, number]> {
        const result = iter.next();
        return result.done
          ? cycle([as[Symbol.iterator](), i + 1], cons)
          : cons(result.value, [iter, i + 1] as [Iterator<a>, number]);
    })
    .reduce();
  }
}
