import type { Tail, Reverse } from '../type';
import { unshift } from '../array';

export type HList<as extends [] | [unknown, ...unknown[]]> =
  as extends readonly [] ? HNil :
  HCons<as>;
export function HList<as extends [] | [unknown, ...unknown[]]>(...as: as): HList<as>;
export function HList<as extends unknown[]>(...as: as): HList<any> {
  return as.reduceRight<HList<any>>((node, a) => node.add(a), HNil as any);
}

type HNil = typeof HNil;
const HNil = new class HNil {
  public add<a>(a: a): HCons<[a]> {
    return new HCons(a, this);
  }
  public reverse(): [] {
    return [];
  }
  public tuple(): [] {
    return [];
  }
}();

class HCons<as extends unknown[]> {
  constructor(
    public readonly head: as[0],
    public readonly tail: as extends readonly [unknown, unknown, ...unknown[]] ? HCons<Tail<as>> : HNil,
  ) {
  }
  public add<a>(a: a): HCons<[a, ...as]> {
    // @ts-ignore
    return new HCons(a, this);
  }
  public modify<a>(f: (a: as[0]) => a): HCons<[a, ...Tail<as>]> {
    // @ts-ignore
    return this.tail.add(f(this.head));
  }
  public fold<a>(this: HCons<[unknown, unknown, ...unknown[]]>, f: (l: as[0], r: as[1]) => a): HCons<[a, ...Tail<Tail<as>>]> {
    // @ts-ignore
    return this.tail.modify(r => f(this.head, r));
  }
  public unfold<a>(f: (a: as[0]) => a): HCons<[a, ...as]> {
    // @ts-ignore
    return this.add(f(this.head));
  }
  public reverse(): Reverse<as> {
    return this.tuple().reverse() as Reverse<as>;
  }
  public tuple(): as {
    return unshift([this.head], this.tail.tuple()) as as;
  }
}
