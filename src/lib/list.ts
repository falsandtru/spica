import {concat} from './concat';

export interface List<a, c extends Nil | List<a, any>> extends Cons<a, c> { }

export class Nil {
  private NIL: void;
  public push<a>(a: a): Cons<a, Nil> {
    return new Cons<a, Nil>(a, this);
  }
}

class Cons<a, c extends Nil | Cons<a, any>> {
  private CONS: a;
  constructor(private head_: a, private tail_: c) {
  }
  public push(a: a): Cons<a, this> {
    return new Cons<a, this>(a, this);
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
  public modify(f: (a: a) => a): Cons<a, c> {
    return (<any>this.tail().push)(f(this.head()));
  }
  public update(f: (a: a) => a): Cons<a, this> {
    return this.push(f(this.head()));
  }
  public array(): a[] {
    return concat(
      [this.head()],
      (<Cons<a, any>><any>this.tail()).array ? (<Cons<a, any>><any>this.tail()).array() : []
    );
  }
}
