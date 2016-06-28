import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static from<a>(as: a[]): Sequence<a, number> {
    return new Sequence<a, number>((i = 0, cons) =>
      i < as.length
        ? cons(as[i], ++i)
        : cons());
  }
}
