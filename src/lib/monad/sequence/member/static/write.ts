import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static write<a>(as: a[]): Sequence<a, a[]> {
    return new Sequence<a, a[]>((_, cons) => as.length > 0 ? cons(as.shift(), as) : cons());
  }
}
