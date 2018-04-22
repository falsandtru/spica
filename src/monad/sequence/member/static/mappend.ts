import { Sequence } from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static mappend<a>(l: Sequence<a, any>, r: Sequence<a, any>): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]> {
    return Sequence.mconcat([l, r]);
  }
}
