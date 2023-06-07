export class List<N extends List.Node = List.Node> {
  public head?: N = undefined;
  public last?: N = undefined;
  public isEmpty(): boolean {
    return this.head === undefined;
  }
  public unshift(node: N): N {
    assert(!node.next);
    if (this.head === undefined) {
      this.head = this.last = node;
    }
    else {
      node.next = this.head;
      this.head = node;
    }
    return node;
  }
  public push(node: N): N {
    assert(!node.next);
    if (this.head === undefined) {
      this.head = this.last = node;
    }
    else {
      this.last = this.last!.next = node;
    }
    return node;
  }
  public shift(): N | undefined {
    assert(this.head);
    const head = this.head!;
    const tail = head.next;
    if (tail === undefined) {
      this.head = this.last = undefined;
    }
    else {
      head.next = undefined;
      this.head = tail;
    }
    return head;
  }
  public clear(): void {
    this.head = this.last = undefined;
  }
  public *[Symbol.iterator](): Iterator<N, undefined, undefined> {
    for (let node = this.head; node !== undefined; node = node!.next) {
      yield node;
    }
  }
  public flatMap<T>(f: (node: N) => ArrayLike<T>): T[] {
    const acc = [];
    for (let node = this.head; node !== undefined; node = node!.next) {
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
    for (let head = this.head, node = head; node;) {
      if (f(node)) return node;
      node = node.next;
      if (node === head) break;
    }
  }
}
export namespace List {
  export class Node {
    public next?: this = undefined;
  }
}
