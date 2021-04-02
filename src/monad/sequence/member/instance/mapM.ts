import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public override mapM<b>(f: (a: a) => Sequence<b, unknown>): Sequence<b[], [Sequence.Iterator<Sequence<b[], unknown>>, Sequence.Iterator<b[]>]> {
    return Sequence.from([0])
      .bind<b[]>(() => {
        const xs = this.extract();
        switch (xs.length) {
          case 0:
            return Sequence.mempty;
          default: {
            const x = xs.shift()!;
            return f(x)
              .bind<b[]>(y =>
                xs.length === 0
                  ? Sequence.from([[y]])
                  : Sequence.from(xs).mapM(f).fmap(ys => [y, ...ys]));
          }
        }
      });
  }
});
