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
  public clear(): void {
    this.length = 0;
    this.head = this.last = undefined;
  }
  public *[Symbol.iterator](): Iterator<N, undefined, undefined> {
    for (let node = this.head; node !== undefined; node = node.next) {
      yield node;
    }
  }
  public flatMap<T>(f: (node: N) => ArrayLike<T>): T[] {
    const acc = [];
    for (let node = this.head; node !== undefined; node = node.next) {
      const as = f(node);
      switch (as.length) {
        case 0:
          break;
        case 1:
          acc.push(as[0]);
          break;
        default:
          for (let len = as.length, i = 0; i < len; ++i) {
            acc.push(as[i]);
          }
      }
    }
    return acc;
  }
  public find(f: (node: N) => unknown): N | undefined {
    for (let node = this.head; node !== undefined; node = node.next) {
      if (f(node)) return node;
    }
  }
}
export namespace List {
  export class Node {
    public next?: this = undefined;
    public prev?: this = undefined;
  }
}
