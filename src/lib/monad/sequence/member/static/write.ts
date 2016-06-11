import {Sequence} from '../../core';
import {compose} from '../../../../compose';

export default class <T, S> extends Sequence<T, S> {
  public static write<T>(as: T[]): Sequence<T, T[]> {
    return new Sequence<T, T[]>((_, cons) => as.length > 0 ? cons(as.shift(), as) : cons());
  }
}
