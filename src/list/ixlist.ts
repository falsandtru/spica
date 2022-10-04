import { Infinity, Array } from '../global';
import { Index as Ix } from '../index';

// Circular Indexed List

const undefined = void 0;

interface InternalNode<K, V> {
  index: number;
  key: K;
  value: V;
  next: number;
  prev: number;
}

export namespace List {
  export interface Node<K, V = undefined> {
    readonly index: number;
    readonly key: K;
    value: V;
    readonly next: number;
    readonly prev: number;
  }
}
export class List<K, V = undefined> {
  constructor(
    public readonly capacity: number = Infinity,
  ) {
  }
  private nodes: InternalNode<K, V>[] = Array(16);
  private readonly ix = new Ix();
  public HEAD = 0;
  private CURSOR = 0;
  private $length = 0;
  public get length() {
    return this.$length;
  }
  public get head(): List.Node<K, V> | undefined {
    return this.node(this.HEAD);
  }
  public get tail(): List.Node<K, V> | undefined {
    const head = this.head;
    return head && this.nodes[head.next];
  }
  public get last(): List.Node<K, V> | undefined {
    const head = this.head;
    return head && this.nodes[head.prev];
  }
  public next(index: number): List.Node<K, V> | undefined {
    const node = this.node(index);
    return node && this.nodes[node.next];
  }
  public prev(index: number): List.Node<K, V> | undefined {
    const node = this.node(index);
    return node && this.nodes[node.prev];
  }
  public node(index: number): List.Node<K, V> | undefined {
    const node = this.nodes[index];
    return node?.index === undefined
      ? undefined
      : node;
  }
  public rotateToNext(): number {
    return this.HEAD = this.tail?.index ?? this.HEAD;
  }
  public rotateToPrev(): number {
    return this.HEAD = this.last?.index ?? this.HEAD;
  }
  public clear(): void {
    this.nodes = Array(16);
    this.ix.clear();
    this.HEAD = 0;
    this.CURSOR = 0;
    this.$length = 0;
  }
  public add(key: K, value: V): number;
  public add(this: List<K, undefined>, key: K, value?: V): number;
  public add(key: K, value: V): number {
    const nodes = this.nodes;
    const head: InternalNode<K, V> | undefined = this.head;
    //assert(this.length === 0 ? !head : head);
    if (!head) {
      assert(this.length === 0);
      const index = this.HEAD = this.CURSOR = this.ix.pop();
      ++this.$length;
      nodes[index] = {
        index,
        key,
        value,
        next: index,
        prev: index,
      };
      assert(index === this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length > 10 || [...this].length === this.length);
      return index;
    }
    //assert(head);
    if (this.$length !== this.capacity) {
      assert(this.length < this.capacity);
      const index = this.HEAD = this.CURSOR = this.ix.pop();
      //assert(!nodes[index]);
      ++this.$length;
      const node = nodes[index];
      if (node) {
        node.index = index;
        node.key = key;
        node.value = value;
        node.next = head.index;
        node.prev = head.prev;
      }
      else {
        nodes[index] = {
          index,
          key,
          value,
          next: head.index,
          prev: head.prev,
        };
      }
      head.prev = nodes[head.prev]!.next = index;
      //assert(this.length !== 1 || index === this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length !== 2 || index !== this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length < 3 || index !== this.nodes[index]!.prev && this.nodes[index]!.prev !== this.nodes[index]!.next);
      //assert(this.length > 10 || [...this].length === this.length);
      return index;
    }
    else {
      assert(this.length === this.capacity);
      assert(this.ix.length === this.capacity);
      const node = nodes[head.prev]!;
      const index = this.HEAD = this.CURSOR = node.index;
      //assert(nodes[index]);
      node.key = key;
      node.value = value;
      //assert(this.length !== 1 || index === this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length !== 2 || index !== this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length < 3 || index !== this.nodes[index]!.prev && this.nodes[index]!.prev !== this.nodes[index]!.next);
      //assert(this.length > 10 || [...this].length === this.length);
      return index;
    }
  }
  public get(index: number): List.Node<K, V> | undefined {
    return this.node(index);
  }
  public has(index: number): boolean {
    return this.node(index) !== undefined;
  }
  public delete(index: number): List.Node<K, V> | undefined {
    const node: InternalNode<K, V> | undefined = this.node(index);
    if (!node) return;
    assert(this.length > 0);
    //assert(this.length !== 1 || node === node.prev && node.prev === node.next);
    //assert(this.length !== 2 || node !== node.prev && node.prev === node.next);
    //assert(this.length < 3 || node !== node.prev && node.prev !== node.next);
    --this.$length;
    const { key, value, next, prev } = node;
    this.ix.push(index);
    const nodes = this.nodes;
    nodes[prev]!.next = next;
    nodes[next]!.prev = prev;
    if (this.HEAD === index) {
      this.HEAD = next;
    }
    if (this.CURSOR === index) {
      this.CURSOR = next;
    }
    node.index = undefined as any;
    node.key = undefined as any;
    node.value = undefined as any;
    //assert(this.length === 0 ? !this.nodes[this.HEAD] : this.nodes[this.HEAD]);
    //assert(this.length === 0 ? !this.nodes[this.CURSOR] : this.nodes[this.CURSOR]);
    //assert(this.length > 10 || [...this].length === this.length);
    return { index, key, value, next, prev };
  }
  public insert(key: K, value: V, before: number): number {
    const head = this.HEAD;
    this.HEAD = before;
    const index = this.add(key, value);
    this.HEAD = head;
    return index;
  }
  public unshift(key: K, value: V): number;
  public unshift(this: List<K, undefined>, key: K, value?: V): number;
  public unshift(key: K, value: V): number {
    return this.add(key, value);
  }
  public unshiftRotationally(key: K, value: V): number;
  public unshiftRotationally(this: List<K, undefined>, key: K, value?: V): number;
  public unshiftRotationally(key: K, value: V): number {
    if (this.$length === 0) return this.unshift(key, value);
    const node: InternalNode<K, V> = this.last!;
    this.HEAD = node.index;
    this.CURSOR = node.index;
    node.key = key;
    node.value = value;
    return node.index;
  }
  public push(key: K, value: V): number;
  public push(this: List<K, undefined>, key: K, value?: V): number;
  public push(key: K, value: V): number {
    return this.insert(key, value, this.HEAD);
  }
  public pushRotationally(key: K, value: V): number;
  public pushRotationally(this: List<K, undefined>, key: K, value?: V): number;
  public pushRotationally(key: K, value: V): number {
    if (this.$length === 0) return this.push(key, value);
    const node: InternalNode<K, V> = this.head!;
    this.HEAD = node.next;
    this.CURSOR = node.index;
    node.key = key;
    node.value = value;
    return node.index;
  }
  public shift(): List.Node<K, V> | undefined {
    const node = this.head;
    return node && this.delete(node.index);
  }
  public pop(): List.Node<K, V> | undefined {
    const node = this.last;
    return node && this.delete(node.index);
  }
  public replace(index: number, key: K, value: V): List.Node<K, V> | undefined;
  public replace(this: List<K, undefined>, index: number, key: K, value?: V): List.Node<K, V> | undefined;
  public replace(index: number, key: K, value: V): List.Node<K, V> | undefined {
    const node: InternalNode<K, V> | undefined = this.node(index);
    if (!node) return;
    const clone = {
      index: node.index,
      key: node.key,
      value: node.value,
      next: node.next,
      prev: node.prev,
    };
    node.key = key;
    node.value = value;
    return clone;
  }
  public move(index: number, before: number): boolean {
    if (index === before) return false;
    const a1: InternalNode<K, V> | undefined = this.node(index);
    if (!a1) return false;
    const b1: InternalNode<K, V> | undefined = this.node(before);
    if (!b1) return false;
    assert(a1 !== b1);
    if (a1.next === b1.index) return false;
    const nodes = this.nodes;
    const b0 = nodes[b1.prev]!;
    const a0 = nodes[a1.prev]!;
    const a2 = nodes[a1.next]!;
    b0.next = a1.index;
    a1.next = b1.index;
    b1.prev = a1.index;
    a1.prev = b0.index;
    a0.next = a2.index;
    a2.prev = a0.index;
    assert(b0.next === a1.index);
    assert(a1.next === b1.index);
    assert(b1.prev === a1.index);
    assert(a1.prev === b0.index);
    assert(a0.next === a2.index);
    assert(a2.prev === a0.index);
    assert(this.length > 10 || [...this].length === this.length);
    return true;
  }
  public moveToHead(index: number): void {
    this.move(index, this.HEAD);
    this.HEAD = index;
  }
  public moveToLast(index: number): void {
    this.move(index, this.HEAD);
    this.HEAD = index === this.HEAD
      ? this.head!.next
      : this.HEAD;
  }
  public swap(index1: number, index2: number): boolean {
    if (index1 === index2) return false;
    const node1 = this.node(index1);
    if (!node1) return false;
    const node2 = this.node(index2);
    if (!node2) return false;
    const nodes = this.nodes;
    const node3 = nodes[node2.next]!;
    this.move(node2.index, node1.index);
    this.move(node1.index, node3.index);
    switch (this.HEAD) {
      case node1.index:
        this.HEAD = node2.index;
        break;
      case node2.index:
        this.HEAD = node1.index;
        break;
    }
    return true;
  }
  public *[Symbol.iterator](): Iterator<[K, V, number], undefined, undefined> {
    const nodes = this.nodes;
    const head = this.head;
    for (let node = head; node;) {
      yield [node.key, node.value, node.index];
      node = nodes[node.next];
      if (node === head) return;
    }
  }
}
