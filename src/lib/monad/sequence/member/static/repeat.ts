import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static repeat<a>(as: a[]): Sequence<a, number> {
    return new Sequence<a, number>((i = 0, cons) =>
      as.length === 0
        ? cons()
        : cons(as[i], ++i % as.length));
  }
}
