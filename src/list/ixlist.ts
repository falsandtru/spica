import { Infinity, Array } from '../global';
import { min } from '../alias';
import { Collection } from '../collection';
import { Stack } from '../stack';
import { equal } from '../compare';

// Circular indexed list

const undefined = void 0;
const BORDER = 1_000_000_000;

interface Index<K, V> extends Collection<K, V> {
  delete(key: K, value?: V): boolean;
  clear(): void;
}

interface InternalNode<K, V> {
  readonly index: number;
  key: K;
  value: V;
  next: number;
  prev: number;
}
export interface Node<K, V = undefined> {
  readonly index: number;
  readonly key: K;
  value: V;
  readonly next: number;
  readonly prev: number;
}

export class List<K, V = undefined> {
  constructor(capacity?: number, index?: Index<K, number>);
  constructor(index: Index<K, number>);
  constructor(capacity: number | Index<K, number> = Infinity, index?: Index<K, number>) {
    if (typeof capacity === 'object') {
      index = capacity;
      capacity = Infinity;
    }
    this.capacity = capacity;
    this.index = index!;
    this.nodes = this.capacity <= BORDER ? Array(min(this.capacity, BORDER)) : {};
  }
  public readonly capacity: number;
  private readonly index?: Index<K, number>;
  private nodes: Record<number, InternalNode<K, V>>;
  private readonly heap = new Stack<number>();
  public HEAD = 0;
  private CURSOR = 0;
  private LENGTH = 0;
  public get length() {
    return this.LENGTH;
  }
  public get head(): Node<K, V> | undefined {
    return this.nodes[this.HEAD];
  }
  public get tail(): Node<K, V> | undefined {
    const head = this.head;
    return head && this.nodes[head.next];
  }
  public get last(): Node<K, V> | undefined {
    const head = this.head;
    return head && this.nodes[head.prev];
  }
  public node(index: number): Node<K, V> | undefined {
    return 0 <= index && index < this.capacity
      ? this.nodes[index]
      : undefined;
  }
  public rotateToNext(): number {
    return this.HEAD = this.tail?.index ?? this.HEAD;
  }
  public rotateToPrev(): number {
    return this.HEAD = this.last?.index ?? this.HEAD;
  }
  public clear(): void {
    this.nodes = this.capacity <= BORDER ? Array(min(this.capacity, BORDER)) : {};
    this.heap.clear();
    this.index?.clear();
    this.HEAD = 0;
    this.CURSOR = 0;
    this.LENGTH = 0;
  }
  public add(key: K, value: V): number;
  public add(this: List<K, undefined>, key: K, value?: V): number;
  public add(key: K, value: V): number {
    if (this.LENGTH === BORDER && 'length' in this.nodes) {
      this.nodes = { ...this.nodes };
    }
    const nodes = this.nodes;
    const head = nodes[this.HEAD];
    //assert(this.length === 0 ? !head : head);
    if (!head) {
      assert(this.length === 0);
      const index = this.HEAD = this.CURSOR = this.heap.length > 0
        ? this.heap.pop()!
        : this.length;
      assert(!nodes[index]);
      ++this.LENGTH;
      this.index?.set(key, index);
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
    if (this.length !== this.capacity) {
      assert(this.length < this.capacity);
      const index = this.HEAD = this.CURSOR = this.heap.length > 0
        ? this.heap.pop()!
        : this.length;
      //assert(!nodes[index]);
      ++this.LENGTH;
      this.index?.set(key, index);
      nodes[index] = {
        index,
        key,
        value,
        next: head.index,
        prev: head.prev,
      };
      head.prev = nodes[head.prev]!.next = index;
      //assert(this.length !== 1 || index === this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length !== 2 || index !== this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length < 3 || index !== this.nodes[index]!.prev && this.nodes[index]!.prev !== this.nodes[index]!.next);
      //assert(this.length > 10 || [...this].length === this.length);
      return index;
    }
    else {
      assert(this.length === this.capacity);
      assert(this.heap.length === 0);
      const node = nodes[head.prev]!;
      const index = this.HEAD = this.CURSOR = node.index;
      //assert(nodes[index]);
      if (this.index && !equal(node.key, key)) {
        this.index.delete(node.key, index);
        this.index.set(key, index);
      }
      node.key = key;
      node.value = value;
      //assert(this.length !== 1 || index === this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length !== 2 || index !== this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length < 3 || index !== this.nodes[index]!.prev && this.nodes[index]!.prev !== this.nodes[index]!.next);
      //assert(this.length > 10 || [...this].length === this.length);
      return index;
    }
  }
  public put(key: K, value: V, index?: number): number;
  public put(this: List<K, undefined>, key: K, value?: V, index?: number): number;
  public put(key: K, value: V, index?: number): number {
    const node = this.find(key, index);
    if (!node) return this.add(key, value);
    assert(this.CURSOR === node.index);
    node.value = value;
    return node.index;
  }
  public find(key: K, index = this.CURSOR): InternalNode<K, V> | undefined {
    let node: InternalNode<K, V> | undefined;
    node = this.node(index);
    if (node && equal(node.key, key)) return this.CURSOR = index, node;
    if (!this.index) throw new Error(`Spica: IxList: Need the index but not given.`);
    if (node ? this.length === 1 : this.length === 0) return;
    node = this.node(index = this.index.get(key) ?? -1);
    assert(!node || equal(node.key, key));
    if (node) return this.CURSOR = index, node;
  }
  public get(index: number): Node<K, V> | undefined {
    return this.node(index);
  }
  public has(index: number): boolean {
    return this.node(index) !== undefined;
  }
  public del(index: number): Node<K, V> | undefined {
    const node = this.node(index);
    if (!node) return;
    assert(this.length > 0);
    //assert(this.length !== 1 || node === node.prev && node.prev === node.next);
    //assert(this.length !== 2 || node !== node.prev && node.prev === node.next);
    //assert(this.length < 3 || node !== node.prev && node.prev !== node.next);
    --this.LENGTH;
    this.heap.push(node.index);
    this.index?.delete(node.key, node.index);
    const nodes = this.nodes;
    nodes[node.prev]!.next = node.next;
    nodes[node.next]!.prev = node.prev;
    if (this.HEAD === node.index) {
      this.HEAD = node.next;
    }
    if (this.CURSOR === node.index) {
      this.CURSOR = node.next;
    }
    // @ts-expect-error
    nodes[node.index] = undefined;
    //assert(this.length === 0 ? !this.nodes[this.HEAD] : this.nodes[this.HEAD]);
    //assert(this.length === 0 ? !this.nodes[this.CURSOR] : this.nodes[this.CURSOR]);
    //assert(this.length > 10 || [...this].length === this.length);
    return node;
  }
  public delete(key: K, index?: number): Node<K, V> | undefined {
    return this.del(this.find(key, index)?.index ?? -1);
  }
  public insert(key: K, value: V, before: number): number {
    const head = this.HEAD;
    this.HEAD = before;
    const index = this.add(key, value);
    if (this.length !== 1) {
      this.HEAD = head;
    }
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
    if (this.length === 0) return this.unshift(key, value);
    const node: InternalNode<K, V> = this.last!;
    if (this.index && !equal(node.key, key)) {
      this.index.delete(node.key, node.index);
      this.index.set(key, node.index);
    }
    this.HEAD = node.index;
    this.CURSOR = node.index;
    node.key = key;
    node.value = value;
    return node.index;
  }
  public shift(): Node<K, V> | undefined {
    const node = this.head;
    return node && this.del(node.index);
  }
  public push(key: K, value: V): number;
  public push(this: List<K, undefined>, key: K, value?: V): number;
  public push(key: K, value: V): number {
    return this.insert(key, value, this.HEAD);
  }
  public pushRotationally(key: K, value: V): number;
  public pushRotationally(this: List<K, undefined>, key: K, value?: V): number;
  public pushRotationally(key: K, value: V): number {
    if (this.length === 0) return this.push(key, value);
    const node: InternalNode<K, V> = this.head!;
    if (this.index && !equal(node.key, key)) {
      this.index.delete(node.key, node.index);
      this.index.set(key, node.index);
    }
    this.HEAD = node.next;
    this.CURSOR = node.index;
    node.key = key;
    node.value = value;
    return node.index;
  }
  public pop(): Node<K, V> | undefined {
    const node = this.last;
    return node && this.del(node.index);
  }
  public replace(index: number, key: K, value: V): Node<K, V> | undefined;
  public replace(this: List<K, undefined>, index: number, key: K, value?: V): Node<K, V> | undefined;
  public replace(index: number, key: K, value: V): Node<K, V> | undefined {
    const node: InternalNode<K, V> | undefined = this.node(index);
    if (!node) return;
    if (this.index && !equal(node.key, key)) {
      this.index.delete(node.key, index);
      this.index.set(key, index);
    }
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
  public *[Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    const nodes = this.nodes;
    for (let node = nodes[this.HEAD]; node;) {
      yield [node.key, node.value];
      node = nodes[node.next];
      if (node?.index === this.HEAD) return;
    }
  }
}
