import {Sequence} from '../../core';
import {concat} from '../../../../concat';

export default class <a, z> extends Sequence<a, z> {
  public mapM<b>(f: (a: a) => Sequence<b, any>): Sequence<b[], [Sequence.Iterator<Sequence<b[], any>>, Sequence.Iterator<b[]>]> {
    return this
      .take(1)
      .bind(() => {
        const xs = this.read();
        switch (xs.length) {
          case 0:
            return Sequence.from<b[]>([]);
          default: {
            const x = xs.shift();
            return f(x)
              .bind(y =>
                xs.length === 0
                  ? Sequence.from<b[]>([[y]])
                  : Sequence.from(xs).mapM(f).fmap(ys => concat([y], ys)));
          }
        }
      });
  }
}
