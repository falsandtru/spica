import { concat } from './concat';

export interface List<a, c extends Nil | List<a, any>> extends Cons<a, c> { }

export class Nil {
  private readonly NIL: void;
  constructor() {
    void this.NIL;
  }
  public push<a>(a: a): List<a, Nil> {
    return new Cons<a, Nil>(a, this);
  }
  public extend<a>(f: () => a): List<a, Nil> {
    return this.push(f());
  }
  public array(): never[] {
    return [];
  }
}

class Cons<a, c extends Nil | List<a, any>> {
  private readonly CONS: a;
  constructor(
    public readonly head: a,
    public readonly tail: c,
  ) {
    void this.CONS;
  }
  public push(a: a): List<a, List<a, c>> {
    return new Cons<a, this>(a, this);
  }
  public walk(f: (a: a) => void): c {
    void f(this.head);
    return this.tail;
  }
  public modify(f: (a: a) => a): List<a, c> {
    return (<any>this.tail.push)(f(this.head));
  }
  public extend(f: (a: a) => a): List<a, List<a, c>> {
    return this.push(f(this.head));
  }
  public compact<c extends Nil | List<a, any>>(this: List<a, List<a, c>>, f: (l: a, r: a) => a): List<a, c> {
    return this.tail.modify(r => f(this.head, r));
  }
  public reverse(): List<a, c> {
    return <this>this.array()
      .reduce<Nil | List<a, any>>((l: Nil, e: a) => l.push(e), new Nil());
  }
  public tuple(this: List<a, Nil>): [a]
  public tuple(this: List<a, List<a, Nil>>): [a, a]
  public tuple(this: List<a, List<a, List<a, Nil>>>): [a, a, a]
  public tuple(this: List<a, List<a, List<a, List<a, Nil>>>>): [a, a, a, a]
  public tuple(this: List<a, List<a, List<a, List<a, List<a, Nil>>>>>): [a, a, a, a, a]
  public tuple(this: List<a, List<a, List<a, List<a, List<a, List<a, Nil>>>>>>): [a, a, a, a, a, a]
  public tuple(this: List<a, List<a, List<a, List<a, List<a, List<a, List<a, Nil>>>>>>>): [a, a, a, a, a, a, a]
  public tuple(this: List<a, List<a, List<a, List<a, List<a, List<a, List<a, List<a, Nil>>>>>>>>): [a, a, a, a, a, a, a, a]
  public tuple(this: List<a, List<a, List<a, List<a, List<a, List<a, List<a, List<a, List<a, Nil>>>>>>>>>): [a, a, a, a, a, a, a, a, a]
  public tuple(): a[] {
    return this.array();
  }
  public array(): a[] {
    return concat([this.head], this.tail.array());
  }
}
