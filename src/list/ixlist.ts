import { Number } from '../global';
import { Collection, IterableCollection } from '../collection';
import { Stack } from '../stack';
import { equal } from '../compare';

// Circular indexed list

const undefined = void 0;

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
interface Node<K, V> {
  readonly index: number;
  readonly key: K;
  value: V;
  readonly next: number;
  readonly prev: number;
}

export class List<K, V = undefined> implements IterableCollection<K, V> {
  constructor(
    private readonly index?: Index<K, number>,
    public readonly capacity: number = 0,
  ) {
    this.capacity ||= Number.MAX_SAFE_INTEGER;
  }
  private nodes: Record<number, InternalNode<K, V> | undefined> = {};
  private readonly buffers = new Stack<number>();
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
    return this.nodes[index];
  }
  public rotateToNext(): number {
    return this.HEAD = this.tail?.index ?? this.HEAD;
  }
  public rotateToPrev(): number {
    return this.HEAD = this.last?.index ?? this.HEAD;
  }
  public clear(): void {
    this.nodes = {};
    this.buffers.clear();
    this.index?.clear();
    this.HEAD = 0;
    this.CURSOR = 0;
    this.LENGTH = 0;
  }
  public add(key: K, value: V): number;
  public add(this: List<K, undefined>, key: K, value?: V): number;
  public add(key: K, value: V): number {
    const nodes = this.nodes;
    const head = nodes[this.HEAD];
    //assert(this.length === 0 ? !head : head);
    if (!head) {
      assert(this.length === 0);
      const index = this.HEAD = this.CURSOR = this.buffers.length > 0
        ? this.buffers.pop()!
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
      const index = this.HEAD = this.CURSOR = this.buffers.length > 0
        ? this.buffers.pop()!
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
      assert(this.buffers.length === 0);
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
    const node = this.search(key, index);
    if (!node) return this.add(key, value);
    assert(this.CURSOR === node.index);
    node.value = value;
    return node.index;
  }
  public set(key: K, value: V, index?: number): this;
  public set(this: List<K, undefined>, key: K, value?: V, index?: number): this;
  public set(key: K, value: V, index?: number): this {
    this.put(key, value, index);
    return this;
  }
  private search(key: K, cursor = this.CURSOR): InternalNode<K, V> | undefined {
    const nodes = this.nodes;
    let node: InternalNode<K, V> | undefined;
    node = nodes[cursor];
    if (node && equal(node.key, key)) return this.CURSOR = cursor, node;
    if (!this.index) throw new Error(`Spica: IxList: Invalid index.`);
    if (node ? this.length === 1 : this.length === 0) return;
    node = nodes[cursor = this.index.get(key) ?? this.capacity];
    assert(!node || equal(node.key, key));
    if (node) return this.CURSOR = cursor, node;
  }
  public find(key: K, index?: number): Node<K, V> | undefined {
    return this.search(key, index);
  }
  public get(key: K, index?: number): V | undefined {
    return this.search(key, index)?.value;
  }
  public has(key: K, index?: number): boolean {
    return this.search(key, index) !== undefined;
  }
  public del(key: K, index?: number): Node<K, V> | undefined {
    const cursor = this.CURSOR;
    const node = this.search(key, index);
    if (!node) return;
    this.CURSOR = cursor;
    assert(this.length > 0);
    //assert(this.length !== 1 || node === node.prev && node.prev === node.next);
    //assert(this.length !== 2 || node !== node.prev && node.prev === node.next);
    //assert(this.length < 3 || node !== node.prev && node.prev !== node.next);
    --this.LENGTH;
    this.buffers.push(node.index);
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
    nodes[node.index] = undefined;
    //assert(this.length === 0 ? !this.nodes[this.HEAD] : this.nodes[this.HEAD]);
    //assert(this.length === 0 ? !this.nodes[this.CURSOR] : this.nodes[this.CURSOR]);
    //assert(this.length > 10 || [...this].length === this.length);
    return node;
  }
  public delete(key: K, index?: number): boolean {
    return this.del(key, index) !== undefined;
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
    this.HEAD = this.CURSOR = node.index;
    node.key = key;
    node.value = value;
    return node.index;
  }
  public shift(): Node<K, V> | undefined {
    const node = this.head;
    return node && this.del(node.key, node.index);
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
    this.HEAD = this.CURSOR = node.next;
    node.key = key;
    node.value = value;
    return node.index;
  }
  public pop(): Node<K, V> | undefined {
    const node = this.last;
    return node && this.del(node.key, node.index);
  }
  public replace(index: number, key: K, value: V): Node<K, V> | undefined;
  public replace(this: List<K, undefined>, index: number, key: K, value?: V): Node<K, V> | undefined;
  public replace(index: number, key: K, value: V): Node<K, V> | undefined {
    const node = this.nodes[index];
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
    const nodes = this.nodes;
    const a1 = nodes[index];
    if (!a1) return false;
    const b1 = nodes[before];
    if (!b1) return false;
    assert(a1 !== b1);
    if (a1.next === b1.index) return false;
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
  }
  public swap(index1: number, index2: number): boolean {
    if (index1 === index2) return false;
    const nodes = this.nodes;
    const node1 = nodes[index1];
    if (!node1) return false;
    const node2 = nodes[index2];
    if (!node2) return false;
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
