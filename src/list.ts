import { Prepend, Split, AtLeast, Reverse } from './type';

export type List<as extends unknown[]> =
  as extends [unknown, ...unknown[]] ? Cons<as> :
  Nil;

export class Nil {
  private readonly NIL: void;
  constructor() {
    void this.NIL;
  }
  public push<a>(a: a): Cons<[a]> {
    return new Cons(a, this);
  }
  public extend<a>(f: () => a): Cons<[a]> {
    return this.push(f());
  }
  public tuple(): [] {
    return [];
  }
}

class Cons<as extends unknown[]> {
  private readonly CONS!: as;
  constructor(
    public readonly head: Split<as>[0],
    public readonly tail: as['length'] extends 1 ? Nil : Cons<Split<as>[1]>,
  ) {
    void this.CONS;
  }
  public push(a: as[0]): Cons<Prepend<as[0], as>> {
    return new Cons(a, this as any);
  }
  public walk(f: (a: as[0]) => void): this['tail'] {
    void f(this.head);
    return this.tail;
  }
  public modify(f: (a: as[0]) => as[0]): Cons<as> {
    return this.tail.push(f(this.head)) as any;
  }
  public extend(f: (a: as[0]) => as[0]): Cons<Prepend<as[0], as>> {
    return this.push(f(this.head));
  }
  public compact(this: Cons<as extends AtLeast<2, unknown> ? as : never>, f: (l: as[0], r: as[1]) => as[0]): Cons<Split<as>[1]> {
    return (this.tail as Cons<Split<as>[1]>).modify(r => f(this.head, r)) as any;
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
