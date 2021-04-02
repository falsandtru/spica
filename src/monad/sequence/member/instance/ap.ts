import { Sequence } from '../../core';
import { compose } from '../../../../helper/compose';

compose(Sequence, class <a, z> extends Sequence<a, z> {
  public override ap<a, z>(this: Sequence<(a: a) => z, unknown>, a: Sequence<a, unknown>): Sequence<z, [Sequence.Iterator<Sequence<z, unknown>>, Sequence.Iterator<z>]>
  public override ap<a, b, z>(this: Sequence<(a: a, b: b) => z, unknown>, a: Sequence<a, unknown>): Sequence<(b: b) => z, [Sequence.Iterator<Sequence<z, unknown>>, Sequence.Iterator<z>]>
  public override ap<a, b, c, z>(this: Sequence<(a: a, b: b, c: c) => z, unknown>, a: Sequence<a, unknown>): Sequence<(b: b, c: c) => z, [Sequence.Iterator<Sequence<z, unknown>>, Sequence.Iterator<z>]>
  public override ap<a, b, c, d, z>(this: Sequence<(a: a, b: b, c: c, d: d) => z, unknown>, a: Sequence<a, unknown>): Sequence<(b: b, c: c, d: d) => z, [Sequence.Iterator<Sequence<z, unknown>>, Sequence.Iterator<z>]>
  public override ap<a, b, c, d, e, z>(this: Sequence<(a: a, b: b, c: c, d: d, e: e) => z, unknown>, a: Sequence<a, unknown>): Sequence<(b: b, c: c, d: d, e: e) => z, [Sequence.Iterator<Sequence<z, unknown>>, Sequence.Iterator<z>]>
  public override ap<a, z>(this: Sequence<(...as: unknown[]) => z, unknown>, a: Sequence<a, unknown>): Sequence<z, [Sequence.Iterator<Sequence<z, unknown>>, Sequence.Iterator<z>]> {
    return Sequence.ap(this, a);
  }
});
