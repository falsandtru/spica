import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public fold<b>(f: (a: a, b: Sequence<b, any>) => Sequence<b, any>, z: Sequence<b, any>): Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]> {
    return new Sequence<Sequence<b, any>, Sequence.Iterator<a>>((iter = () => this.reduce().iterate()) =>
      Sequence.Iterator.when(
        iter(),
        () =>
          Sequence.Data.cons<Sequence<b, any>, Sequence.Iterator<a>>(z),
        thunk =>
          Sequence.Data.cons<Sequence<b, any>, Sequence.Iterator<a>>(
            f(
              Sequence.Thunk.value(thunk),
              Sequence.resume(Sequence.Thunk.iterator(thunk))
                .fold(f, z)))))
      .bind(s => s);
  }
}
