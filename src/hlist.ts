import { concat } from './concat';

export type HList<a, c extends HNil | NonEmptyHList<any, any>> = HNil | NonEmptyHList<a, c>;
export type NonEmptyHList<a, c extends HNil | NonEmptyHList<any, any>> = HCons<a, c>;

export class HNil {
  private readonly NIL: void;
  constructor() {
    void this.NIL;
  }
  public push<a>(a: a): NonEmptyHList<a, HNil> {
    return new HCons<a, HNil>(a, this);
  }
  public extend<a>(f: () => a): NonEmptyHList<a, HNil> {
    return this.push(f());
  }
  public array(): [] {
    return [];
  }
}

class HCons<a, c extends HNil | NonEmptyHList<any, any>> {
  private readonly CONS!: a;
  constructor(
    public readonly head: a,
    public readonly tail: c,
  ) {
    void this.CONS;
  }
  public push<b>(b: b): NonEmptyHList<b, NonEmptyHList<a, c>> {
    return new HCons<b, this>(b, this);
  }
  public walk(f: (a: a) => void): c {
    void f(this.head);
    return this.tail;
  }
  public modify<b>(f: (a: a) => b): NonEmptyHList<b, c> {
    return (<any>this.tail.push)(f(this.head));
  }
  public extend<b>(f: (a: a) => b): NonEmptyHList<b, NonEmptyHList<a, c>> {
    return this.push(f(this.head));
  }
  public compact<b, c, d extends HNil | NonEmptyHList<any, any>>(this: NonEmptyHList<a, NonEmptyHList<b, d>>, f: (a: a, b: b) => c): NonEmptyHList<c, d> {
    return this.tail.modify(r => f(this.head, r));
  }
  public reverse<a>(this: NonEmptyHList<a, HNil>): NonEmptyHList<a, HNil>
  public reverse<a, b>(this: NonEmptyHList<a, NonEmptyHList<b, HNil>>): NonEmptyHList<b, NonEmptyHList<a, HNil>>
  public reverse<a, b, c>(this: NonEmptyHList<a, NonEmptyHList<b, NonEmptyHList<c, HNil>>>): NonEmptyHList<c, NonEmptyHList<b, NonEmptyHList<a, HNil>>>
  public reverse<a, b, c, d>(this: NonEmptyHList<a, NonEmptyHList<b, NonEmptyHList<c, NonEmptyHList<d, HNil>>>>): NonEmptyHList<d, NonEmptyHList<c, NonEmptyHList<b, NonEmptyHList<a, HNil>>>>
  public reverse<a, b, c, d, e>(this: NonEmptyHList<a, NonEmptyHList<b, NonEmptyHList<c, NonEmptyHList<d, NonEmptyHList<e, HNil>>>>>): NonEmptyHList<e, NonEmptyHList<d, NonEmptyHList<c, NonEmptyHList<b, NonEmptyHList<a, HNil>>>>>
  public reverse<a, b, c, d, e, f>(this: NonEmptyHList<a, NonEmptyHList<b, NonEmptyHList<c, NonEmptyHList<d, NonEmptyHList<e, NonEmptyHList<f, HNil>>>>>>): NonEmptyHList<f, NonEmptyHList<e, NonEmptyHList<d, NonEmptyHList<c, NonEmptyHList<b, NonEmptyHList<a, HNil>>>>>>
  public reverse<a, b, c, d, e, f, g>(this: NonEmptyHList<a, NonEmptyHList<b, NonEmptyHList<c, NonEmptyHList<d, NonEmptyHList<e, NonEmptyHList<f, NonEmptyHList<g, HNil>>>>>>>): NonEmptyHList<g, NonEmptyHList<f, NonEmptyHList<e, NonEmptyHList<d, NonEmptyHList<c, NonEmptyHList<b, NonEmptyHList<a, HNil>>>>>>>
  public reverse<a, b, c, d, e, f, g, h>(this: NonEmptyHList<a, NonEmptyHList<b, NonEmptyHList<c, NonEmptyHList<d, NonEmptyHList<e, NonEmptyHList<f, NonEmptyHList<g, NonEmptyHList<h, HNil>>>>>>>>): NonEmptyHList<h, NonEmptyHList<g, NonEmptyHList<f, NonEmptyHList<e, NonEmptyHList<d, NonEmptyHList<c, NonEmptyHList<b, NonEmptyHList<a, HNil>>>>>>>>
  public reverse<a, b, c, d, e, f, g, h, i>(this: NonEmptyHList<a, NonEmptyHList<b, NonEmptyHList<c, NonEmptyHList<d, NonEmptyHList<e, NonEmptyHList<f, NonEmptyHList<g, NonEmptyHList<h, NonEmptyHList<i, HNil>>>>>>>>>): NonEmptyHList<i, NonEmptyHList<h, NonEmptyHList<g, NonEmptyHList<f, NonEmptyHList<e, NonEmptyHList<d, NonEmptyHList<c, NonEmptyHList<b, NonEmptyHList<a, HNil>>>>>>>>>
  public reverse(): NonEmptyHList<any, any> {
    return <this>this.array()
      .reduce<HNil | NonEmptyHList<a, any>>((l: HNil, e: a) => l.push(e), new HNil());
  }
  public tuple<a>(this: NonEmptyHList<a, HNil>): [a]
  public tuple<a, b>(this: NonEmptyHList<a, NonEmptyHList<b, HNil>>): [a, b]
  public tuple<a, b, c>(this: NonEmptyHList<a, NonEmptyHList<b, NonEmptyHList<c, HNil>>>): [a, b, c]
  public tuple<a, b, c, d>(this: NonEmptyHList<a, NonEmptyHList<b, NonEmptyHList<c, NonEmptyHList<d, HNil>>>>): [a, b, c, d]
  public tuple<a, b, c, d, e>(this: NonEmptyHList<a, NonEmptyHList<b, NonEmptyHList<c, NonEmptyHList<d, NonEmptyHList<e, HNil>>>>>): [a, b, c, d, e]
  public tuple<a, b, c, d, e, f>(this: NonEmptyHList<a, NonEmptyHList<b, NonEmptyHList<c, NonEmptyHList<d, NonEmptyHList<e, NonEmptyHList<f, HNil>>>>>>): [a, b, c, d, e, f]
  public tuple<a, b, c, d, e, f, g>(this: NonEmptyHList<a, NonEmptyHList<b, NonEmptyHList<c, NonEmptyHList<d, NonEmptyHList<e, NonEmptyHList<f, NonEmptyHList<g, HNil>>>>>>>): [a, b, c, d, e, f, g]
  public tuple<a, b, c, d, e, f, g, h>(this: NonEmptyHList<a, NonEmptyHList<b, NonEmptyHList<c, NonEmptyHList<d, NonEmptyHList<e, NonEmptyHList<f, NonEmptyHList<g, NonEmptyHList<h, HNil>>>>>>>>): [a, b, c, d, e, f, g, h]
  public tuple<a, b, c, d, e, f, g, h, i>(this: NonEmptyHList<a, NonEmptyHList<b, NonEmptyHList<c, NonEmptyHList<d, NonEmptyHList<e, NonEmptyHList<f, NonEmptyHList<g, NonEmptyHList<h, NonEmptyHList<i, HNil>>>>>>>>>): [a, b, c, d, e, f, g, h, i]
  public tuple(): any[] {
    return this.array();
  }
  public array(): [] {
    return <[]>concat([this.head], this.tail.array());
  }
}
