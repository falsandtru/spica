import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public tails(): Sequence<a[], [Sequence.Iterator<a[]>, Sequence.Iterator<a[]>]> {
    return Sequence.mappend(
      Sequence.from(this.extract().map((_, i, as) => as.slice(i))),
      Sequence.from([[]]));
  }
}
