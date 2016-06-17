import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public static Return<T>(a: T): Sequence<T, number> {
    return new Sequence<T, number>((_, cons) => cons(a));
  }
}
