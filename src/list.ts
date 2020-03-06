export type List<T> = Cons<T>;
export function List<T>(...values: T[]): List<T> {
  let node = Nil<T>();
  for (let i = values.length; i--;) {
    node = node.add(values[i]);
  }
  return node;
}

function Nil<T>(): List<T> {
  return new Cons<never>(void 0 as never, void 0 as never);
}
// Don't extend any class for performance.
class Cons<T> {
  constructor(
    public readonly head: T,
    public readonly tail: List<T>,
  ) {
  }
  public add(value: T): List<T> {
    return new Cons(value, this);
  }
  public foldl<U>(f: (acc: U, value: T) => U, acc: U): U {
    for (let node: List<T> = this; node.tail; node = node.tail) {
      acc = f(acc, node.head);
    }
    return acc;
  }
  public foldr<U>(f: (value: T, acc: U) => U, acc: U): U {
    for (let node: List<T> = this.reverse(); node.tail; node = node.tail) {
      acc = f(node.head, acc);
    }
    return acc;
  }
  public map<U>(f: (value: T) => U): List<U> {
    const first = List<U>();
    for (let last = first, node: List<T> = this; node.tail; node = node.tail) {
      last = last.append(f(node.head));
    }
    return first;
  }
  private replaceWith(head: T, tail: List<T>): List<T> {
    assert(tail !== this);
    // @ts-ignore
    this.head = head;
    // @ts-ignore
    this.tail = tail;
    return this;
  }
  private append(value: T): List<T> {
    assert(!this.tail);
    return this.replaceWith(value, List()).tail;
  }
  public split(index: number): [List<T>, List<T>] {
    const init = Nil<T>();
    let tail: List<T> = this;
    for (let cnt = 0, last = init; cnt < index && tail.tail; ++cnt, tail = tail.tail) {
      last = last.append(tail.head);
    }
    return [init, tail];
  }
  public reverse(): List<T> {
    return this.foldl((acc, value) => acc.add(value), List());
  }
  public get length(): number {
    return this.foldl(acc => acc + 1, 0);
  }
  public *[Symbol.iterator](): IterableIterator<T> {
    for (let node: List<T> = this; node.tail; node = node.tail) {
      yield node.head;
    }
  }
}

export type MList<T> = MCons<T>;
export function MList<T>(...values: T[]): MList<T> {
  let node = MNil<T>();
  for (let i = values.length; i--;) {
    node = node.add(values[i]);
  }
  return node;
}

function MNil<T>(): MList<T> {
  return new MCons<never>(void 0 as never, void 0 as never);
}
// Don't extend any class for performance.
class MCons<T> {
  public take(count: number): MList<T> {
    const { 0: init, 1: tail } = this.split(count);
    if (this.tail && tail !== this) {
      this.replaceWith(tail.head, tail.tail);
    }
    return init;
  }
  public prepend(value: T): MList<T> {
    return this.replaceWith(value, new MCons(this.head, this.tail));
  }
  private replace(node: MList<T>, count: number, adds?: MList<T>): MList<T> {
    const { 0: dels, 1: { head, tail } } = node.split(count);
    if (adds?.tail) {
      node.replaceWith(adds.head, adds.tail);
      for (; node.tail; node = node.tail);
    }
    node.replaceWith(head, tail);
    return dels;
  }
  public splice(index: number, count: number = 0, adds?: MList<T>): MList<T> {
    let node: MList<T> = this;
    for (let i = 0; i < index && node.tail; ++i, node = node.tail);
    return this.replace(node, count, adds);
  }
  public interleave(find: (value: T, index: number) => boolean, count: number, adds?: MList<T>): MList<T> | undefined {
    let node: MList<T> = this;
    let index = 0;
    for (; ; ++index, node = node.tail) {
      if (find(node.head, node.tail ? index : -1)) break;
      if (!node.tail) return;
    }
    return this.replace(node, count, adds);
  }
  public convert<U>(f: (value: T) => U): MList<U> {
    for (let tail: MList<T | U> = this; tail.tail; tail = tail.tail) {
      tail.replaceWith(f(tail.head as T), tail.tail);
    }
    return this as MList<any>;
  }
  public freeze(): List<T> {
    const first = List<T>();
    for (let last = first, tail: MList<T> = this; tail.tail; tail = tail.tail) {
      last = last['append'](tail.head);
    }
    return first;
  }
  constructor(
    public readonly head: T,
    public readonly tail: MList<T>,
  ) {
  }
  public add(value: T): MList<T> {
    return new MCons(value, this);
  }
  public foldl<U>(f: (acc: U, value: T) => U, acc: U): U {
    for (let node: MList<T> = this; node.tail; node = node.tail) {
      acc = f(acc, node.head);
    }
    return acc;
  }
  public foldr<U>(f: (value: T, acc: U) => U, acc: U): U {
    for (let node: MList<T> = this.reverse(); node.tail; node = node.tail) {
      acc = f(node.head, acc);
    }
    return acc;
  }
  public map<U>(f: (value: T) => U): MList<U> {
    const first = MList<U>();
    for (let last = first, node: MList<T> = this; node.tail; node = node.tail) {
      last = last.append(f(node.head));
    }
    return first;
  }
  private replaceWith(head: T, tail: MList<T>): MList<T> {
    //assert(tail !== this);
    // @ts-ignore
    this.head = head;
    // @ts-ignore
    this.tail = tail;
    return this;
  }
  private append(value: T): MList<T> {
    assert(!this.tail);
    return this.replaceWith(value, MList()).tail;
  }
  public split(index: number): [MList<T>, MList<T>] {
    const init = MNil<T>();
    let tail: MList<T> = this;
    for (let cnt = 0, last = init; cnt < index && tail.tail; ++cnt, tail = tail.tail) {
      last = last.append(tail.head);
    }
    return [init, tail];
  }
  public reverse(): MList<T> {
    if (!this.tail) return this;
    for (let prev = MList<T>(), node: MList<T> = this, next: MList<T>; ;) {
      next = node.tail;
      node.replaceWith(node.head, prev);
      if (!next.tail) return node;
      prev = node;
      node = next;
    }
  }
  public get length(): number {
    return this.foldl(acc => acc + 1, 0);
  }
  public *[Symbol.iterator](): IterableIterator<T> {
    for (let node: MList<T> = this; node.tail; node = node.tail) {
      yield node.head;
    }
  }
}
