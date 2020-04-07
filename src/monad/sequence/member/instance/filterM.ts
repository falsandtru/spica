import { Sequence } from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public filterM(f: (a: a) => Sequence<boolean, unknown>): Sequence<a[], [Sequence.Iterator<Sequence<a[], unknown>>, Sequence.Iterator<a[]>]> {
    return Sequence.from([0])
      .bind<a[]>(() => {
        const xs = this.extract();
        switch (xs.length) {
          case 0:
            return Sequence.from([[]]);
          default: {
            const x = xs.shift()!;
            return f(x)
              .bind<a[]>(b =>
                b
                  ? xs.length === 0
                    ? Sequence.from([[x]])
                    : Sequence.from(xs).filterM(f).fmap(ys => [x, ...ys])
                  : xs.length === 0
                    ? Sequence.from([[]])
                    : Sequence.from(xs).filterM(f));
          }
        }
      });
  }
}
