import {Sequence} from '../../core';
import {concat} from '../../../../concat';

export default class <a, z> extends Sequence<a, z> {
  public mapM<b>(f: (a: a) => Sequence<b, any>): Sequence<b[], [Sequence.Iterator<Sequence<b[], any>>, Sequence.Iterator<b[]>]> {
    return Sequence.from([0])
      .bind<b[]>(() => {
        const xs = this.read();
        switch (xs.length) {
          case 0:
            return Sequence.from([]);
          default: {
            const x = xs.shift();
            return f(x)
              .bind<b[]>(y =>
                xs.length === 0
                  ? Sequence.from([[y]])
                  : Sequence.from(xs).mapM(f).fmap(ys => concat([y], ys)));
          }
        }
      });
  }
}
