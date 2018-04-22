import { concat } from './concat';

export type List<a, c extends Nil | NonEmptyList<a, any>> = Nil | NonEmptyList<a, c>;
export type NonEmptyList<a, c extends Nil | NonEmptyList<a, any>> = Cons<a, c>;

export class Nil {
  private readonly NIL: void;
  constructor() {
    void this.NIL;
  }
  public push<a>(a: a): NonEmptyList<a, Nil> {
    return new Cons<a, Nil>(a, this);
  }
  public extend<a>(f: () => a): NonEmptyList<a, Nil> {
    return this.push(f());
  }
  public array(): never[] {
    return [];
  }
}

class Cons<a, c extends Nil | NonEmptyList<a, any>> {
  private readonly CONS!: a;
  constructor(
    public readonly head: a,
    public readonly tail: c,
  ) {
    void this.CONS;
  }
  public push(a: a): NonEmptyList<a, NonEmptyList<a, c>> {
    return new Cons<a, this>(a, this);
  }
  public walk(f: (a: a) => void): c {
    void f(this.head);
    return this.tail;
  }
  public modify(f: (a: a) => a): NonEmptyList<a, c> {
    return (<any>this.tail.push)(f(this.head));
  }
  public extend(f: (a: a) => a): NonEmptyList<a, NonEmptyList<a, c>> {
    return this.push(f(this.head));
  }
  public compact<c extends Nil | NonEmptyList<a, any>>(this: NonEmptyList<a, NonEmptyList<a, c>>, f: (l: a, r: a) => a): NonEmptyList<a, c> {
    return this.tail.modify(r => f(this.head, r));
  }
  public reverse(): NonEmptyList<a, c> {
    return <this>this.array()
      .reduce<Nil | NonEmptyList<a, any>>((l: Nil, e: a) => l.push(e), new Nil());
  }
  public tuple(this: NonEmptyList<a, Nil>): [a]
  public tuple(this: NonEmptyList<a, NonEmptyList<a, Nil>>): [a, a]
  public tuple(this: NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, Nil>>>): [a, a, a]
  public tuple(this: NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, Nil>>>>): [a, a, a, a]
  public tuple(this: NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, Nil>>>>>): [a, a, a, a, a]
  public tuple(this: NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, Nil>>>>>>): [a, a, a, a, a, a]
  public tuple(this: NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, Nil>>>>>>>): [a, a, a, a, a, a, a]
  public tuple(this: NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, Nil>>>>>>>>): [a, a, a, a, a, a, a, a]
  public tuple(this: NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, NonEmptyList<a, Nil>>>>>>>>>): [a, a, a, a, a, a, a, a, a]
  public tuple(): a[] {
    return this.array();
  }
  public array(): a[] {
    return concat([this.head], this.tail.array());
  }
}
