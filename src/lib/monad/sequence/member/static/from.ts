import {Sequence} from '../../core';
import {compose} from '../../../../compose';

export default class <T, S> extends Sequence<T, S> {
  public static from<T>(as: T[]): Sequence<T, number> {
    return new Sequence<T, number>((i = 0, cons) => i < as.length ? cons(as[i], ++i) : cons());
  }
}
