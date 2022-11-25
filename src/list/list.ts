// Memory-efficient flexible list.

export class List<N extends List.Node = List.Node> {
  public length = 0;
  public head?: N;
  public insert(node: N, before?: N): N {
    assert(!node.next);
    if (++this.length === 1) {
      return this.head = node.next = node.prev = node;
    }
    const next = node.next = before ?? this.head!;
    const prev = node.prev = next.prev!;
    return next.prev = prev.next = node;
  }
  public delete(node: N): N {
    assert(node.next);
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
  public clear(): void {
    this.length = 0;
    this.head = undefined;
  }
  public *[Symbol.iterator](): Iterator<N, undefined, undefined> {
    let head = this.head;
    for (let node = head; node !== undefined;) {
      yield node;
      node = node.next;
      if (node === head) return;
    }
  }
  public flatMap<T>(f: (node: N) => ArrayLike<T>): T[] {
    const acc = [];
    for (let head = this.head, node = head; node;) {
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
      node = node.next;
      if (node === head) break;
    }
    return acc;
  }
  public find(f: (node: N) => unknown): N | undefined {
    for (let head = this.head, node = head; node;) {
      if (f(node)) return node;
      node = node.next;
      if (node === head) break;
    }
  }
}
export namespace List {
  export interface Node {
    next?: this;
    prev?: this;
  }
}
