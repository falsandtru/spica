import { Sequence } from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public join<b>(this: Sequence<Sequence<b, any>, any>): Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]> {
    return Sequence.concat(this);
  }
}
