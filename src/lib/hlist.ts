export interface HList<a, c extends HNil | HList<any, any>> extends HCons<a, c> { }

export class HNil {
  private NIL: void;
  constructor() {
    void this.NIL;
  }
  public push<b>(b: b): HCons<b, HNil> {
    return new HCons<b, HNil>(b, this);
  }
}

class HCons<a, c extends HNil | HCons<any, any>> {
  private CONS: a;
  constructor(private head_: a, private tail_: c) {
    void this.CONS;
  }
  public push<b>(b: b): HCons<b, this> {
    return new HCons<b, this>(b, this);
  }
  public head(): a {
    return this.head_;
  }
  public tail(): c {
    return this.tail_;
  }
  public walk(f: (a: a) => void): c {
    void f(this.head());
    return this.tail();
  }
  public modify<b>(f: (a: a) => b): HCons<b, c> {
    return (<any>this.tail().push)(f(this.head()));
  }
  public extend<b>(f: (a: a) => b): HCons<b, this> {
    return this.push(f(this.head()));
  }
}
