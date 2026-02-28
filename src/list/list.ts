// Memory-efficient flexible list.

// LRUではclistの方が速い。

export class List<N extends List.Node = List.Node> {
  public length = 0;
  public head?: N = undefined;
  public last?: N = undefined;
  public get tail(): N | undefined {
    return this.head?.next;
  }
  public insert(node: N, before?: N): N {
    assert(!node.next && !node.prev);
    if (before === undefined) return this.push(node);
    if (before === this.head) return this.unshift(node);
    if (++this.length === 1) {
      return this.head = this.last = node;
    }
    assert(node !== before);
    const next = node.next = before;
    const prev = node.prev = next.prev!;
    return next.prev = prev.next = node;
  }
  public delete(node: N): N {
    assert(node.next || node.prev || this.head === this.last);
    assert(this.length > 0);
    if (--this.length === 0) {
      this.head = this.last = undefined;
    }
    else {
      const { next, prev } = node;
      prev === undefined
        ? this.head = next
        : prev.next = next;
      next === undefined
        ? this.last = prev
        : next.prev = prev;
    }
    node.next = node.prev = undefined;
    return node;
  }
  public unshift(node: N): N {
    assert(!node.next && !node.prev);
    if (++this.length === 1) {
      return this.head = this.last = node;
    }
    node.next = this.head;
    return this.head = this.head!.prev = node;
  }
  public push(node: N): N {
    assert(!node.next && !node.prev);
    if (++this.length === 1) {
      return this.head = this.last = node;
    }
    node.prev = this.last;
    return this.last = this.last!.next = node;
  }
  public shift(): N | undefined {
    if (this.length === 0) return;
    return this.delete(this.head!);
  }
  public pop(): N | undefined {
    if (this.length === 0) return;
    return this.delete(this.last!);
  }
  public import(list: List<N>, before?: N): this {
    assert(list !== this);
    if (list.length === 0) return this;
    if (this.length === 0) {
      this.head = list.head;
      this.length += list.length;
      list.head = undefined;
      list.length = 0;
      return this;
    }
    const head = list.head!;
    const last = list.last!;
    const next = last.next = before ?? this.head!;
    const prev = head.prev = next.prev!;
    next.prev = last;
    prev.next = head;
    this.length += list.length;
    list.length = 0;
    list.head = undefined;
    return this;
  }
  public clear(): void {
    this.length = 0;
    this.head = this.last = undefined;
  }
  public *[Symbol.iterator](): Iterator<N, undefined, undefined> {
    for (let node = this.head; node && this.head;) {
      const next = node.next;
      yield node;
      node = next;
    }
  }
  public flatMap<T extends List.Node>(f: (node: N) => List<T>): List<T> {
    const acc = new List<T>();
    for (let node = this.head; node && this.head;) {
      const next = node.next;
      acc.import(f(node));
      node = next;
    }
    return acc;
  }
  public foldl<T>(f: (acc: T, node: N) => T, acc: T): T {
    for (let node = this.head; node && this.head;) {
      const next = node.next;
      acc = f(acc, node);
      node = next;
    }
    return acc;
  }
  public foldr<T>(f: (node: N, acc: T) => T, acc: T): T {
    for (let node = this.head?.prev; node && this.head;) {
      const prev = node.prev;
      acc = f(node, acc);
      node = prev;
    }
    return acc;
  }
  public find(f: (node: N) => unknown): N | undefined {
    for (let node = this.head; node && this.head;) {
      const next = node.next;
      if (f(node)) return node;
      node = next;
    }
  }
}
export namespace List {
  export class Node {
    public next?: this = undefined;
    public prev?: this = undefined;
  }
}
