import {Sequence} from '../../core';
import {compose} from '../../../../compose';
import {concat} from '../../../../concat';

export default class <T, S> extends Sequence<T, S> {
  public filterM(f: (p: T) => Sequence<boolean, any>): Sequence<T[], [Sequence.Iterator<T>, Sequence.Iterator<T[]>]> {
    return this
      .take(1)
      .bind(() => {
        const xs = this.read();
        switch (xs.length) {
          case 0:
            return Sequence.from<T[]>([[]]);
          default: {
            const x = xs.shift();
            return f(x)
              .bind(b =>
                b
                  ? xs.length === 0
                    ? Sequence.from<T[]>([[x]])
                    : Sequence.from(xs).filterM(f).fmap(ys => concat([x], ys))
                  : xs.length === 0
                    ? Sequence.from<T[]>([[]])
                    : Sequence.from(xs).filterM(f));
          }
        }
      });
  }
}
