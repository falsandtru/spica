// Circular inverse list

const undefined = void 0;

const LENGTH = Symbol('length');

export class List<T> {
  public [LENGTH] = 0;
  public get length(): number {
    return this[LENGTH];
  }
  public head: Node<T> | undefined = undefined;
  public get tail(): Node<T> | undefined {
    return this.head?.next;
  }
  public get last(): Node<T> | undefined {
    return this.head?.prev;
  }
  public clear(): void {
    this.head = undefined;
    this[LENGTH] = 0;
  }
  public unshift(value: T): Node<T> {
    return this.head = this.push(value);
  }
  public unshiftRotationally(value: T): Node<T> {
    const node = this.last;
    if (!node) return this.unshift(value);
    node.value = value;
    this.head = node;
    return node;
  }
  public shift(): T | undefined {
    return this.head?.delete();
  }
  public push(value: T): Node<T> {
    return new Node(value, this.head, this.head?.prev, this);
  }
  public pushRotationally(value: T): Node<T> {
    const node = this.head;
    if (!node) return this.push(value);
    node.value = value;
    this.head = node.next;
    return node;
  }
  public pop(): T | undefined {
    return this.last?.delete();
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    for (let node = this.head; node;) {
      yield node.value;
      node = node.next;
      if (node === this.head) return;
    }
  }
}

export class Node<T> {
  constructor(
    public value: T,
    public next?: Node<T>,
    public prev?: Node<T>,
    public readonly list: List<T> = next ? next.list : new List(),
  ) {
    ++list[LENGTH];
    list.head ??= this;
    next
      ? next.prev = this
      : this.next = this;
    prev
      ? prev.next = this
      : this.prev = this;
  }
  public delete(): T {
    if (!this.next && !this.prev) return this.value;
    --this.list[LENGTH];
    if (this.list.head === this) {
      this.list.head = this.next === this
        ? undefined
        : this.next;
    }
    if (this.next) {
      this.next.prev = this.prev;
    }
    if (this.prev) {
      this.prev.next = this.next;
    }
    // @ts-expect-error
    this.list = undefined;
    this.next = this.prev = undefined;
    return this.value;
  }
  public insertBefore(value: T): Node<T> {
    return new Node(value, this, this.prev, this.list);
  }
  public insertAfter(value: T): Node<T> {
    return new Node(value, this.next, this, this.list);
  }
  public move(before: Node<T> | undefined): boolean {
    if (!before) return false;
    if (this === before) return false;
    const a1 = this;
    if (!a1) return false;
    const b1 = before;
    if (!b1) return false;
    assert(a1 !== b1);
    if (a1.next === b1) return false;
    const b0 = b1.prev!;
    const a0 = a1.prev!;
    const a2 = a1.next!;
    b0.next = a1;
    a1.next = b1;
    b1.prev = a1;
    a1.prev = b0;
    a0.next = a2;
    a2.prev = a0;
    return true;
  }
  public moveToHead(): void {
    this.move(this.list.head);
    this.list.head = this;
  }
  public moveToLast(): void {
    this.move(this.list.head);
  }
  public swap(node: Node<T>): boolean {
    const node1 = this;
    const node2 = node;
    if (node1 === node2) return false;
    const node3 = node2.next!;
    node2.move(node1);
    node1.move(node3);
    switch (this.list.head) {
      case node1:
        this.list.head = node2;
        break;
      case node2:
        this.list.head = node1;
        break;
    }
    return true;
  }
}
