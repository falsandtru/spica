import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public bind<b>(f: (a: a) => Sequence<b, any>): Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]> {
    return Sequence.concat(this.fmap(f));
  }
}
