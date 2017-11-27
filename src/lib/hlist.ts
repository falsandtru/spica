import { concat } from './concat';

export interface HList<a, c extends HNil | HList<any, any>> extends HCons<a, c> { }

export class HNil {
  private readonly NIL: void;
  constructor() {
    void this.NIL;
  }
  public push<a>(a: a): HList<a, HNil> {
    return new HCons<a, HNil>(a, this);
  }
  public extend<a>(f: () => a): HList<a, HNil> {
    return this.push(f());
  }
  public array(): never[] {
    return [];
  }
}

class HCons<a, c extends HNil | HList<any, any>> {
  private readonly CONS!: a;
  constructor(
    public readonly head: a,
    public readonly tail: c,
  ) {
    void this.CONS;
  }
  public push<b>(b: b): HList<b, HList<a, c>> {
    return new HCons<b, this>(b, this);
  }
  public walk(f: (a: a) => void): c {
    void f(this.head);
    return this.tail;
  }
  public modify<b>(f: (a: a) => b): HList<b, c> {
    return (<any>this.tail.push)(f(this.head));
  }
  public extend<b>(f: (a: a) => b): HList<b, HList<a, c>> {
    return this.push(f(this.head));
  }
  public compact<b, c, d extends HNil | HList<any, any>>(this: HList<a, HList<b, d>>, f: (a: a, b: b) => c): HList<c, d> {
    return this.tail.modify(r => f(this.head, r));
  }
  public reverse<a>(this: HList<a, HNil>): HList<a, HNil>
  public reverse<a, b>(this: HList<a, HList<b, HNil>>): HList<b, HList<a, HNil>>
  public reverse<a, b, c>(this: HList<a, HList<b, HList<c, HNil>>>): HList<c, HList<b, HList<a, HNil>>>
  public reverse<a, b, c, d>(this: HList<a, HList<b, HList<c, HList<d, HNil>>>>): HList<d, HList<c, HList<b, HList<a, HNil>>>>
  public reverse<a, b, c, d, e>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HNil>>>>>): HList<e, HList<d, HList<c, HList<b, HList<a, HNil>>>>>
  public reverse<a, b, c, d, e, f>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HList<f, HNil>>>>>>): HList<f, HList<e, HList<d, HList<c, HList<b, HList<a, HNil>>>>>>
  public reverse<a, b, c, d, e, f, g>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HList<f, HList<g, HNil>>>>>>>): HList<g, HList<f, HList<e, HList<d, HList<c, HList<b, HList<a, HNil>>>>>>>
  public reverse<a, b, c, d, e, f, g, h>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HList<f, HList<g, HList<h, HNil>>>>>>>>): HList<h, HList<g, HList<f, HList<e, HList<d, HList<c, HList<b, HList<a, HNil>>>>>>>>
  public reverse<a, b, c, d, e, f, g, h, i>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HList<f, HList<g, HList<h, HList<i, HNil>>>>>>>>>): HList<i, HList<h, HList<g, HList<f, HList<e, HList<d, HList<c, HList<b, HList<a, HNil>>>>>>>>>
  public reverse(): HList<any, any> {
    return <this>this.array()
      .reduce<HNil | HList<a, any>>((l: HNil, e: a) => l.push(e), new HNil());
  }
  public tuple<a>(this: HList<a, HNil>): [a]
  public tuple<a, b>(this: HList<a, HList<b, HNil>>): [a, b]
  public tuple<a, b, c>(this: HList<a, HList<b, HList<c, HNil>>>): [a, b, c]
  public tuple<a, b, c, d>(this: HList<a, HList<b, HList<c, HList<d, HNil>>>>): [a, b, c, d]
  public tuple<a, b, c, d, e>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HNil>>>>>): [a, b, c, d, e]
  public tuple<a, b, c, d, e, f>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HList<f, HNil>>>>>>): [a, b, c, d, e, f]
  public tuple<a, b, c, d, e, f, g>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HList<f, HList<g, HNil>>>>>>>): [a, b, c, d, e, f, g]
  public tuple<a, b, c, d, e, f, g, h>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HList<f, HList<g, HList<h, HNil>>>>>>>>): [a, b, c, d, e, f, g, h]
  public tuple<a, b, c, d, e, f, g, h, i>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HList<f, HList<g, HList<h, HList<i, HNil>>>>>>>>>): [a, b, c, d, e, f, g, h, i]
  public tuple(): any[] {
    return this.array();
  }
  public array(): never[] {
    return <never[]>concat([this.head], this.tail.array());
  }
}
