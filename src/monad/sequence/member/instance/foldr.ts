import { Sequence } from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public foldr<b>(f: (a: a, b: Sequence<b, any>) => Sequence<b, any>, z: Sequence<b, any>): Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]> {
    return new Sequence<Sequence<b, any>, Sequence.Iterator<a>>((iter = () => this.reduce().iterate()) =>
      Sequence.Iterator.when(
        iter(),
        () =>
          Sequence.Data.cons(z),
        thunk =>
          Sequence.Data.cons(
            f(
              Sequence.Thunk.value(thunk),
              Sequence.resume(Sequence.Thunk.iterator(thunk))
                .foldr(f, z)))))
      .bind(s => s);
  }
}
