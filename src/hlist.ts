import type { Prepend, Split, AtLeast, Reverse } from './type';
import { unshift } from './array';

export type HList<as extends unknown[]> =
  as extends [unknown, ...unknown[]] ? HCons<as> :
  HNil;
export function HList<as extends unknown[]>(...as: as): HList<as>;
export function HList<as extends unknown[]>(...as: as): HList<any> {
  return as.length === 0
    ? HNil
    : as.reduceRight<HList<[unknown]>>((node, a) => node.add(a) as any, HNil as any);
}

type HNil = typeof HNil;
const HNil = new class HNil {
  private readonly TYPE!: [];
  constructor() {
    this.TYPE;
  }
  public add<a>(a: a): HCons<[a]> {
    return new HCons(a, this);
  }
  public unfold<a>(f: () => a): HCons<[a]> {
    return this.add(f());
  }
  public tuple(): [] {
    return [];
  }
}();

class HCons<as extends unknown[]> {
  private readonly TYPE!: as;
  constructor(
    public readonly head: Split<as>[0],
    public readonly tail: as['length'] extends 1 ? HNil : HCons<Split<as>[1]>,
  ) {
    this.TYPE;
  }
  public add<a>(a: a): HCons<Prepend<a, as>> {
    return new HCons(a, this as any);
  }
  public modify<a>(f: (a: as[0]) => a): HCons<Prepend<a, Split<as>[1]>> {
    return (this.tail.add as any)(f(this.head));
  }
  public fold<a>(this: HCons<as extends AtLeast<2, unknown> ? as : never>, f: (l: as[0], r: as[1]) => a): HCons<Prepend<a, Split<Split<as>[1]>[1]>> {
    return (this.tail as HCons<Split<as>[1]>).modify(r => f(this.head, r)) as any;
  }
  public unfold<a>(f: (a: as[0]) => a): HCons<Prepend<a, as>> {
    return this.add(f(this.head));
  }
  public reverse(): Reverse<as> {
    return this.tuple().reverse() as any;
  }
  public tuple(): as {
    return unshift([this.head], this.tail.tuple()) as as;
  }
}
