import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static ap<a, b>(ff: Sequence<() => b, any>): () => Sequence<() => b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]>
  public static ap<a, b>(ff: Sequence<(a: a) => b, any>): (fa: Sequence<a, any>) => Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]>
  public static ap<a, b>(ff: Sequence<(a: a) => b, any>): (fa: Sequence<a, any>) => Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]> {
    return (fa: Sequence<a, any>) => ff.bind(f => fa.fmap(a => f(a)));
  }
}
