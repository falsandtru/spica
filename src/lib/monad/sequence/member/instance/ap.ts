import { Sequence } from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public ap<a, z>(this: Sequence<(a: a) => z, any>, a: Sequence<a, any>): Sequence<z, [Sequence.Iterator<Sequence<z, any>>, Sequence.Iterator<z>]>
  public ap<a, b, z>(this: Sequence<(a: a, b: b) => z, any>, a: Sequence<a, any>): Sequence<(b: b) => z, [Sequence.Iterator<Sequence<z, any>>, Sequence.Iterator<z>]>
  public ap<a, b, c, z>(this: Sequence<(a: a, b: b, c: c) => z, any>, a: Sequence<a, any>): Sequence<(b: b, c: c) => z, [Sequence.Iterator<Sequence<z, any>>, Sequence.Iterator<z>]>
  public ap<a, b, c, d, z>(this: Sequence<(a: a, b: b, c: c, d: d) => z, any>, a: Sequence<a, any>): Sequence<(b: b, c: c, d: d) => z, [Sequence.Iterator<Sequence<z, any>>, Sequence.Iterator<z>]>
  public ap<a, b, c, d, e, z>(this: Sequence<(a: a, b: b, c: c, d: d, e: e) => z, any>, a: Sequence<a, any>): Sequence<(b: b, c: c, d: d, e: e) => z, [Sequence.Iterator<Sequence<z, any>>, Sequence.Iterator<z>]>
  public ap<a, z>(this: Sequence<(...as: any[]) => z, any>, a: Sequence<a, any>): Sequence<z, [Sequence.Iterator<Sequence<z, any>>, Sequence.Iterator<z>]> {
    return Sequence.ap(this, a);
  }
}
