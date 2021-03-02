import { Infinity } from '../global';
import { MultiMap } from '../multimap';
import { indexOf, splice } from '../array';
import { equal } from '../compare';

// Weighted optimal indexed circular linked list

export class WList<K, V = undefined> {
  constructor(
    private readonly space: number,
    private readonly capacity: number = Infinity,
  ) {
    assert(capacity > 0);
  }
  private nodes: (Node<K, V> | undefined)[] = [];
  private empties: number[] = [];
  private index = new MultiMap<K, number>();
  private head = 0;
  private cursor = 0;
  public length = 0;
  public size = 0;
  public clear(): void {
    this.nodes = [];
    this.empties = [];
    this.index.clear();
    this.head = 0;
    this.cursor = 0;
    this.length = 0;
    this.size = 0;
  }
  public add(this: WList<K, undefined>, key: K, value?: V, size?: number): boolean;
  public add(key: K, value: V, size?: number): boolean;
  public add(key: K, value: V, size: number = 1): boolean {
    assert(size > 0);
    const nodes = this.nodes;
    const head = nodes[this.head];
    assert(this.length === 0 ? !head : head);
    if (!head) {
      assert(this.length === 0);
      const index = this.head = this.cursor = this.empties.length > 0
        ? this.empties.shift()!
        : this.length;
      //assert(!nodes[index]);
      ++this.length;
      this.size += size;
      this.index.set(key, index);
      nodes[index] =
        new Node(index, key, value, size, head!, head!);
      //assert(this.nodes[index] === this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length > 10 || [...this].length === this.length);
      return false;
    }
    assert(head);
    if (this.length < this.capacity) {
      if (this.secure(size)) return this.add(key, value, size);
      const index = this.head = this.cursor = this.empties.length > 0
        ? this.empties.shift()!
        : this.length;
      //assert(!nodes[index]);
      ++this.length;
      this.size += size;
      this.index.set(key, index);
      nodes[index] = head.prev = head.prev.next =
        new Node(index, key, value, size, head, head.prev);
      //assert(this.length !== 1 || this.nodes[index] === this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length !== 2 || this.nodes[index] !== this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length < 3 || this.nodes[index] !== this.nodes[index]!.prev && this.nodes[index]!.prev !== this.nodes[index]!.next);
      //assert(this.length > 10 || [...this].length === this.length);
      return false;
    }
    else {
      assert(this.length === this.capacity);
      assert(this.empties.length === 0);
      const garbage = head.prev;
      assert(garbage.index === this.index.get(garbage.key));
      if (this.secure(size - garbage.size)) return this.add(key, value, size);
      const index = this.head = this.cursor = garbage.index;
      //assert(nodes[index]);
      this.index.take(garbage.key);
      this.index.set(key, index);
      this.size += size - garbage.size;
      nodes[index] = head.prev = head.prev.prev.next =
        new Node(index, key, value, size, head, head.prev.prev);
      // @ts-expect-error
      garbage.key = garbage.value = garbage.prev = garbage.next = void 0;
      //assert(this.length !== 1 || this.nodes[index] === this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length !== 2 || this.nodes[index] !== this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length < 3 || this.nodes[index] !== this.nodes[index]!.prev && this.nodes[index]!.prev !== this.nodes[index]!.next);
      //assert(this.length > 10 || [...this].length === this.length);
      return false;
    }
  }
  public put(this: WList<K, undefined>, key: K, value?: V, size?: number, index?: number): boolean;
  public put(key: K, value: V, size?: number, index?: number): boolean;
  public put(key: K, value: V, size: number = 1, index?: number): boolean {
    const node = this.seek(key, index);
    if (!node) return this.add(key, value, size);
    if (this.secure(size - node.size) && !node.next) return this.put(key, value, size);
    assert(this.cursor === node.index);
    this.size += size - node.size;
    node.value = value;
    node.size = size;
    return true;
  }
  private secure(margin: number): boolean {
    let change = false;
    while (this.size > this.space - margin) {
      change = true;
      this.pop();
    }
    return change;
  }
  public shift(): { key: K; value: V; size: number; } | undefined {
    //assert(this.length === 0 ? !this.nodes[this.head] : this.nodes[this.head]);
    const node = this.nodes[this.head];
    //assert(this.length === 0 ? !node : node);
    return node && this.delete(node.key, node.index);
  }
  public pop(): { key: K; value: V; size: number; } | undefined {
    //assert(this.length === 0 ? !this.nodes[this.head] : this.nodes[this.head]);
    const node = this.nodes[this.head]?.prev;
    //assert(this.length === 0 ? !node : node);
    return node && this.delete(node.key, node.index);
  }
  public delete(key: K, index?: number): { key: K; value: V; size: number; } | undefined {
    const cursor = this.cursor;
    const node = this.seek(key, index);
    if (!node) return;
    this.cursor = cursor;
    assert(this.length > 0);
    //assert(this.length !== 1 || node === node.prev && node.prev === node.next);
    //assert(this.length !== 2 || node !== node.prev && node.prev === node.next);
    //assert(this.length < 3 || node !== node.prev && node.prev !== node.next);
    --this.length;
    this.size -= node.size;
    this.empties.push(node.index);
    const indexes = this.index.ref(node.key);
    assert(indexes.length > 0);
    assert(indexes.includes(node.index));
    switch (node.index) {
      case indexes[0]:
        indexes.shift();
        break;
      case indexes[indexes.length - 1]:
        indexes.pop();
        break;
      default:
        splice(indexes, indexOf(indexes, node.index), 1);
    }
    const { prev, next, value, size } = node;
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
    return { key, value, size };
  }
  public peek(at?: -1 | 0): { index: number; key: K; value: V; size: number; } | undefined {
    const node = at ? this.nodes[this.head]?.prev : this.nodes[this.head];
    return node && {
      index: node.index,
      key: node.key,
      value: node.value,
      size: node.size,
    };
  }
  public node(index: number): { index: number; key: K; value: V; size: number; } {
    const node = this.nodes[index];
    if (!node) throw new Error(`Spica: WList: Invalid index.`);
    return {
      index: node.index,
      key: node.key,
      value: node.value,
      size: node.size,
    };
  }
  public next(index: number): { index: number; key: K; value: V; size: number; } {
    return this.node(this.nodes[index]?.next.index ?? this.capacity);
  }
  public prev(index: number): { index: number; key: K; value: V; size: number; } {
    return this.node(this.nodes[index]?.prev.index ?? this.capacity);
  }
  public find(key: K, index?: number): V | undefined {
    return this.seek(key, index)?.value;
  }
  public findIndex(key: K, index?: number): number | undefined {
    return this.seek(key, index)?.index;
  }
  public has(key: K, index?: number): boolean {
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
    node = this.nodes[cursor = this.index.get(key) ?? this.capacity];
    if (!node) return;
    if (equal(node.key, key)) return this.cursor = cursor, node;
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
    //assert(a0.next === b1);
    //assert(b1.next === a1);
    //assert(a1.prev === b1);
    //assert(b1.prev === a0);
    //assert(b0.next === b2);
    //assert(b2.prev === b0);
    //assert(this.length > 10 || [...this].length === this.length);
    return true;
  }
  public moveToTop(index: number): boolean {
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
    public size: number,
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
