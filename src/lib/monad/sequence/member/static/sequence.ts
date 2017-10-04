import { Sequence } from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static sequence<b>(ms: Sequence<b, any>[]): Sequence<Sequence<b, [Sequence.Iterator<b>, Sequence.Iterator<b>]>, Sequence.Iterator<Sequence<b, [Sequence.Iterator<b>, Sequence.Iterator<b>]>>> {
    return ms.reduce<Sequence<Sequence<b, [Sequence.Iterator<b>, Sequence.Iterator<b>]>, Sequence.Iterator<Sequence<b, [Sequence.Iterator<b>, Sequence.Iterator<b>]>>>>((acc, m) =>
      acc.fmap(bs =>
        Sequence.mappend(bs, m))
    , Sequence.Return(Sequence.from([])) as Sequence<Sequence<b, any>, any>);
  }
}
