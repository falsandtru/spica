import {Sequence} from '../../core';
import {concat} from '../../../../concat';

export default class <T, S> extends Sequence<T, S> {
  public read(): T[] {
    const acc: T[] = [];
    let iter = () => this.iterate();
    while (true) {
      const thunk = iter();
      if (!Sequence.isIterable(thunk)) return acc;
      void concat(acc, [Sequence.Thunk.value(thunk)]);
      iter = Sequence.Thunk.iterator(thunk);
    }
  }
}
