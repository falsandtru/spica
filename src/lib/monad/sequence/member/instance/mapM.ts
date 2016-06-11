import {Sequence} from '../../core';
import {compose} from '../../../../compose';
import {concat} from '../../../../concat';

export default class <T, S> extends Sequence<T, S> {
  public mapM<U>(f: (p: T) => Sequence<U, any>): Sequence<U[], [Sequence.Iterator<T>, Sequence.Iterator<U[]>]> {
    return this
      .take(1)
      .bind(() => {
        const xs = this.read();
        switch (xs.length) {
          case 0:
            return Sequence.from<U[]>([]);
          default: {
            const x = xs.shift();
            return f(x)
              .bind(y =>
                xs.length === 0
                  ? Sequence.from<U[]>([[y]])
                  : Sequence.from(xs).mapM(f).fmap(ys => concat([y], ys)));
          }
        }
      });
  }
}
