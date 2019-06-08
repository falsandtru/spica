import { Prepend, Split, AtLeast, Reverse } from './type';

export type HList<as extends unknown[]> =
  as extends [unknown, ...unknown[]] ? HCons<as> :
  HNil;

export type HNil = typeof HNil;
export const HNil = new class HNil {
  private readonly NIL: void;
  constructor() {
    void this.NIL;
  }
  public push<a>(a: a): HCons<[a]> {
    return new HCons(a, this);
  }
  public extend<a>(f: () => a): HCons<[a]> {
    return this.push(f());
  }
  public tuple(): [] {
    return [];
  }
}();

class HCons<as extends unknown[]> {
  private readonly CONS!: as;
  constructor(
    public readonly head: Split<as>[0],
    public readonly tail: as['length'] extends 1 ? HNil : HCons<Split<as>[1]>,
  ) {
    void this.CONS;
  }
  public push<a>(a: a): HCons<Prepend<a, as>> {
    return new HCons(a, this as any);
  }
  public walk(f: (a: as[0]) => void): this['tail'] {
    void f(this.head);
    return this.tail;
  }
  public modify<a>(f: (a: as[0]) => a): HCons<Prepend<a, Split<as>[1]>> {
    return (this.tail.push as any)(f(this.head));
  }
  public extend<a>(f: (a: as[0]) => a): HCons<Prepend<a, as>> {
    return this.push(f(this.head));
  }
  public compact<a>(this: HCons<as extends AtLeast<2, unknown> ? as : never>, f: (l: as[0], r: as[1]) => a): HCons<Prepend<a, Split<Split<as>[1]>[1]>> {
    return (this.tail as HCons<Split<as>[1]>).modify(r => f(this.head, r)) as any;
  }
  public reverse(): Reverse<as> {
    return this.tuple().reverse() as any;
  }
  public tuple(): as {
    const t = this.tail.tuple();
    void t.unshift(this.head);
    return t as as;
  }
}
