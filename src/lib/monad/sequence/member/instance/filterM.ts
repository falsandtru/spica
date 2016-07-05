import {Sequence} from '../../core';
import {concat} from '../../../../concat';

export default class <a, z> extends Sequence<a, z> {
  public filterM(f: (a: a) => Sequence<boolean, any>): Sequence<a[], [Sequence.Iterator<Sequence<a[], any>>, Sequence.Iterator<a[]>]> {
    return Sequence.from([0])
      .bind(() => {
        const xs = this.read();
        switch (xs.length) {
          case 0:
            return Sequence.from<a[]>([[]]);
          default: {
            const x = xs.shift();
            return f(x)
              .bind(b =>
                b
                  ? xs.length === 0
                    ? Sequence.from<a[]>([[x]])
                    : Sequence.from(xs).filterM(f).fmap(ys => concat([x], ys))
                  : xs.length === 0
                    ? Sequence.from<a[]>([[]])
                    : Sequence.from(xs).filterM(f));
          }
        }
      });
  }
}
