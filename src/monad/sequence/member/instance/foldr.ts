import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public override foldr<b>(f: (a: a, b: Sequence<b, unknown>) => Sequence<b, unknown>, z: Sequence<b, unknown>): Sequence<b, [Sequence.Iterator<Sequence<b, unknown>>, Sequence.Iterator<b>]> {
    return new Sequence<Sequence<b, unknown>, Sequence.Iterator<a>>((iter = () => this.reduce().iterate()) =>
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
});
