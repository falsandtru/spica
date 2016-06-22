import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public bind<U>(f: (p: T) => Sequence<U, any>): Sequence<U, [Sequence.Iterator<Sequence<U, any>>, Sequence.Iterator<U>]> {
    return Sequence.concat(this.fmap(f));
  }
}
