import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static cycle<a>(as: Iterable<a>): Sequence<a, [Iterator<a>, number, Map<number, IteratorResult<a>>]> {
    return new Sequence<a, [Iterator<a>, number, Map<number, IteratorResult<a>>]>(
      function cycle(
        [iter, i, cache] = [as[Symbol.iterator](), 0, new Map<number, IteratorResult<a>>()],
        cons)
      : Sequence.Data<a, [Iterator<a>, number, Map<number, IteratorResult<a>>]> {
      const result = cache.has(i)
        ? cache.get(i)!
        : cache.set(i, iter.next()).get(i)!;
      return result.done
        ? cycle([as[Symbol.iterator](), i + 1, cache], cons)
        : cons(result.value, [iter, i + 1, cache]);
    });
  }
}
