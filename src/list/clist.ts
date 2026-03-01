// Memory-efficient flexible list.

export class List<N extends List.Node = List.Node> {
  public length = 0;
  public head?: N = undefined;
  public get tail(): N | undefined {
    return this.head?.next;
  }
  public get last(): N | undefined {
    return this.head?.prev;
  }
  public insert(node: N, before?: N): N {
    assert(!node.next);
    if (++this.length === 1) {
      return this.head = node.next = node.prev = node;
    }
    assert(node !== before);
    const next = node.next = before ?? this.head!;
    const prev = node.prev = next.prev!;
    return next.prev = prev.next = node;
  }
  public delete(node: N): N {
    assert(node.next);
    assert(this.length > 0);
    if (--this.length === 0) {
      this.head = undefined;
    }
    else {
      const { next, prev } = node;
      if (node === this.head) {
        this.head = next;
      }
      // Error if not used.
      prev!.next = next;
      next!.prev = prev;
    }
    node.next = node.prev = undefined;
    return node;
  }
  public unshift(node: N): N {
    assert(!node.next);
    return this.head = this.insert(node, this.head);
  }
  public push(node: N): N {
    assert(!node.next);
    return this.insert(node, this.head);
  }
  public shift(): N | undefined {
    if (this.length === 0) return;
    return this.delete(this.head!);
  }
  public pop(): N | undefined {
    if (this.length === 0) return;
    return this.delete(this.head!.prev!);
  }
  public import(list: List<N>, before?: N): this {
    assert(list !== this);
    if (list.length === 0) return this;
    if (this.length === 0) {
      this.head = list.head;
      this.length = list.length;
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
    this.head = undefined;
  }
  public *[Symbol.iterator](): Iterator<N, undefined, undefined> {
    for (let node = this.head; node && this.head;) {
      const next = node.next;
      yield node;
      node = next;
      if (node === this.head) break;
    }
  }
  public flatMap<T extends List.Node>(f: (node: N) => List<T>): List<T> {
    const acc = new List<T>();
    for (let node = this.head; node && this.head;) {
      const next = node.next;
      acc.import(f(node));
      node = next;
      if (node === this.head) break;
    }
    return acc;
  }
  public foldl<T>(f: (acc: T, node: N) => T, acc: T): T {
    for (let node = this.head; node && this.head;) {
      const next = node.next;
      acc = f(acc, node);
      node = next;
      if (node === this.head) break;
    }
    return acc;
  }
  public foldr<T>(f: (node: N, acc: T) => T, acc: T): T {
    for (let node = this.head?.prev; node && this.head;) {
      const prev = node.prev;
      acc = f(node, acc);
      if (node === this.head) break;
      node = prev;
    }
    return acc;
  }
  public find(f: (node: N) => unknown): N | undefined {
    for (let node = this.head; node && this.head;) {
      const next = node.next;
      if (f(node)) return node;
      node = next;
      if (node === this.head) break;
    }
  }
}
export namespace List {
  export class Node {
    public next?: this = undefined;
    public prev?: this = undefined;
  }
}
