import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static Return<a>(a: a): Sequence<a, number> {
    return new Sequence<a, number>((_, cons) => cons(a));
  }
}
