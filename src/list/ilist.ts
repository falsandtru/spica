import { equal } from '../compare';

// Indexed circular linked list

export class IList<K, V = undefined> {
  constructor(
    private readonly capacity: number,
    private readonly strict: boolean = false,
  ) {
    assert(capacity > 0);
  }
  private nodes: (Node<K, V> | undefined)[] = [];
  private empties: number[] = [];
  private head = 0;
  private cursor = 0;
  public length = 0;
  public clear(): void {
    this.nodes = [];
    this.empties = [];
    this.head = 0;
    this.cursor = 0;
    this.length = 0;
  }
  public add(this: IList<K, undefined>, key: K, value?: V): number;
  public add(key: K, value: V): number;
  public add(key: K, value: V): number {
    const nodes = this.nodes;
    const head = nodes[this.head];
    //assert(this.length === 0 ? !head : head);
    if (!head) {
      assert(this.length === 0);
      const index = this.head = this.cursor = this.empties.length > 0
        ? this.empties.shift()!
        : this.length;
      //assert(!nodes[index]);
      ++this.length;
      nodes[index] =
        new Node(index, key, value, head!, head!);
      //assert(this.nodes[index] === this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length > 10 || [...this].length === this.length);
      return index;
    }
    //assert(head);
    if (this.length < this.capacity) {
      const index = this.head = this.cursor = this.empties.length > 0
        ? this.empties.shift()!
        : this.length;
      //assert(!nodes[index]);
      ++this.length;
      nodes[index] = head.prev = head.prev.next =
        new Node(index, key, value, head, head.prev);
      //assert(this.length !== 1 || this.nodes[index] === this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length !== 2 || this.nodes[index] !== this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length < 3 || this.nodes[index] !== this.nodes[index]!.prev && this.nodes[index]!.prev !== this.nodes[index]!.next);
      //assert(this.length > 10 || [...this].length === this.length);
      return index;
    }
    else {
      assert(this.length === this.capacity);
      assert(this.empties.length === 0);
      const garbage = head.prev;
      const index = this.head = this.cursor = garbage.index;
      //assert(nodes[index]);
      nodes[index] = head.prev = head.prev.prev.next =
        new Node(index, key, value, head, head.prev.prev);
      // @ts-expect-error
      garbage.key = garbage.value = garbage.prev = garbage.next = void 0;
      //assert(this.length !== 1 || this.nodes[index] === this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length !== 2 || this.nodes[index] !== this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length < 3 || this.nodes[index] !== this.nodes[index]!.prev && this.nodes[index]!.prev !== this.nodes[index]!.next);
      //assert(this.length > 10 || [...this].length === this.length);
      return index;
    }
  }
  public put(this: IList<K, undefined>, key: K, value?: V, index?: number): number;
  public put(key: K, value: V, index?: number): number;
  public put(key: K, value: V, index?: number): number {
    const node = this.seek(key, index);
    if (!node) return this.add(key, value);
    assert(this.cursor === node.index);
    node.value = value;
    return node.index;
  }
  public shift(): { key: K; value: V; } | undefined {
    //assert(this.length === 0 ? !this.nodes[this.head] : this.nodes[this.head]);
    const node = this.nodes[this.head];
    //assert(this.length === 0 ? !node : node);
    return node && this.delete(node.key, node.index);
  }
  public pop(): { key: K; value: V; } | undefined {
    //assert(this.length === 0 ? !this.nodes[this.head] : this.nodes[this.head]);
    const node = this.nodes[this.head]?.prev;
    //assert(this.length === 0 ? !node : node);
    return node && this.delete(node.key, node.index);
  }
  public delete(key: K, index?: number): { key: K; value: V; } | undefined {
    const cursor = this.cursor;
    const node = this.seek(key, index);
    if (!node) return;
    this.cursor = cursor;
    assert(this.length > 0);
    //assert(this.length !== 1 || node === node.prev && node.prev === node.next);
    //assert(this.length !== 2 || node !== node.prev && node.prev === node.next);
    //assert(this.length < 3 || node !== node.prev && node.prev !== node.next);
    --this.length;
    this.empties.push(node.index);
    const { prev, next, value } = node;
    prev.next = next;
    next.prev = prev;
    if (this.head === node.index) {
      this.head = next.index;
    }
    if (this.cursor === node.index) {
      this.cursor = next.index;
    }
    // @ts-expect-error
    this.nodes[node.index] = node.key = node.value = node.prev = node.next = void 0;
    //assert(this.length === 0 ? !this.nodes[this.head] : this.nodes[this.head]);
    //assert(this.length === 0 ? !this.nodes[this.cursor] : this.nodes[this.cursor]);
    //assert(this.length > 10 || [...this].length === this.length);
    return { key, value };
  }
  public peek(at?: -1 | 0): { index: number; key: K; value: V; } | undefined {
    const node = at ? this.nodes[this.head]?.prev : this.nodes[this.head];
    return node && {
      index: node.index,
      key: node.key,
      value: node.value,
    };
  }
  public node(index: number): { index: number; key: K; value: V; } {
    const node = this.nodes[index];
    if (!node) throw new Error(`Spica: IList: Invalid index.`);
    return {
      index: node.index,
      key: node.key,
      value: node.value,
    };
  }
  public next(index: number): { index: number; key: K; value: V; } {
    return this.node(this.nodes[index]?.next.index ?? this.capacity);
  }
  public prev(index: number): { index: number; key: K; value: V; } {
    return this.node(this.nodes[index]?.prev.index ?? this.capacity);
  }
  public find(key: K, index?: number): V | undefined {
    if (this.strict) throw new Error(`Spica: IList: Invalid cursor.`);
    return this.seek(key, index)?.value;
  }
  public findIndex(key: K, index?: number): number | undefined {
    if (this.strict) throw new Error(`Spica: IList: Invalid cursor.`);
    return this.seek(key, index)?.index;
  }
  public has(key: K, index?: number): boolean {
    if (this.strict) throw new Error(`Spica: IList: Invalid cursor.`);
    return !!this.seek(key, index);
  }
  public *[Symbol.iterator](): Iterator<[K, V, number], undefined, undefined> {
    for (let node = this.nodes[this.head], i = 0; node && i < this.length; (node = node.next) && ++i) {
      yield [node.key, node.value, node.index];
    }
    return;
  }
  private seek(key: K, cursor = this.cursor): Node<K, V> | undefined {
    let node: Node<K, V> | undefined;
    node = this.nodes[cursor];
    if (!node) return;
    if (equal(node.key, key)) return this.cursor = cursor, node;
    if (this.strict) throw new Error(`Spica: IList: Invalid cursor.`);
    for (let i = 1; i < this.length && (node = node.next); ++i) {
      if (equal(node.key, key)) return this.cursor = node.index, node;
    }
  }
  public insert(index: number, before: number): boolean {
    if (index === before) return false;
    const a1 = this.nodes[before];
    if (!a1) return false;
    const b1 = this.nodes[index];
    if (!b1) return false;
    assert(a1 !== b1);
    if (b1.next === a1) return false;
    const a0 = a1.prev;
    const b0 = b1.prev;
    const b2 = b1.next;
    a0.next = b1;
    b1.next = a1;
    a1.prev = b1;
    b1.prev = a0;
    b0.next = b2;
    b2.prev = b0;
    assert(a0.next === b1);
    assert(b1.next === a1);
    assert(a1.prev === b1);
    assert(b1.prev === a0);
    assert(b0.next === b2);
    assert(b2.prev === b0);
    assert(this.length > 10 || [...this].length === this.length);
    return true;
  }
  public moveToHead(index: number): boolean {
    if (this.length <= 1) return false;
    if (index === this.head) return false;
    const node = this.nodes[index];
    if (!node) return false;
    this.insert(index, this.head);
    this.head = index;
    return true;
  }
  public moveToPrev(index: number): boolean {
    if (this.length <= 1) return false;
    if (index === this.head) return false;
    const node = this.nodes[index];
    if (!node) return false;
    this.insert(node.index, node.prev.index);
    if (node.next.index === this.head) {
      this.head = node.index;
    }
    return true;
  }
  public swap(index1: number, index2: number): boolean {
    if (this.length <= 1) return false;
    if (index1 === index2) return false;
    const node1 = this.nodes[index1];
    const node2 = this.nodes[index2];
    if (!node1 || !node2) return false;
    if (node1.next === node2) return this.moveToPrev(index2);
    if (node2.next === node1) return this.moveToPrev(index1);
    const node3 = node2.next;
    this.insert(node2.index, node1.index);
    this.insert(node1.index, node3.index);
    switch (this.head) {
      case node1.index:
        this.head = node2.index;
        break;
      case node2.index:
        this.head = node1.index;
        break;
    }
    return true;
  }
}

class Node<K, V> {
  constructor(
    public readonly index: number,
    public readonly key: K,
    public value: V,
    public next: Node<K, V>,
    public prev: Node<K, V>,
  ) {
    if (!next || next.index === index) {
      assert(!next || next.next === next);
      this.next = this;
    }
    if (!prev || prev.index === index) {
      assert(!prev || prev.prev === prev);
      this.prev = this;
    }
  }
}
