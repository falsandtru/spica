import { Sequence } from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public join<b>(this: Sequence<Sequence<b, unknown>, unknown>): Sequence<b, [Sequence.Iterator<Sequence<b, unknown>>, Sequence.Iterator<b>]> {
    return Sequence.concat(this);
  }
}
