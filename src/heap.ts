import { Array, Uint32Array, Map } from './global';
import { max, min } from './alias';
import { Index } from './index';
import { List as InvList } from './invlist';
import { memoize } from './memoize';

const undefined = void 0;

// Max heap

export namespace Heap {
  export interface Options {
    stable?: boolean;
    deletion?: boolean;
  }
}
export class Heap<T, O = T> {
  public static readonly max = <O>(a: O, b: O): number => a > b ? -1 : a < b ? 1 : 0;
  public static readonly min = <O>(a: O, b: O): number => a > b ? 1 : a < b ? -1 : 0;
  constructor(
    private readonly cmp: (a: O, b: O) => number = Heap.max,
    options?: Heap.Options,
  ) {
    this.stable = options?.stable ?? false;
    this.array = new List(options?.deletion ?? false);
  }
  private readonly stable: boolean;
  private readonly array: List<T, O>;
  public get length(): number {
    return this.array.length;
  }
  public isEmpty(): boolean {
    return this.array.length === 0;
  }
  public peek(): T | undefined {
    return this.array.value(this.array.index(0));
  }
  public insert(this: Heap<T, T>, value: T): number;
  public insert(value: T, order: O): number;
  public insert(value: T, order?: O): number {
    if (arguments.length < 2) {
      order = value as any;
    }
    assert([order = order!]);
    const index = this.array.push(value, order);
    upHeapify(this.cmp, this.array, this.length);
    return index;
  }
  public replace(this: Heap<T, T>, value: T): T | undefined;
  public replace(value: T, order: O): T | undefined;
  public replace(value: T, order?: O): T | undefined {
    if (arguments.length < 2) {
      order = value as any;
    }
    assert([order = order!]);
    if (this.length === 0) return void this.insert(value, order);
    const replaced = this.peek();
    const index = this.array.index(0);
    this.array.setValue(index, value);
    this.array.setOrder(index, order);
    downHeapify(this.cmp, this.array, 1, this.length, this.stable);
    return replaced;
  }
  public extract(): T | undefined {
    if (this.length === 0) return;
    const value = this.peek();
    this.del(0);
    return value;
  }
  private del(index: number): void {
    swap(this.array, index, this.length - 1);
    this.array.pop();
    sort(this.cmp, this.array, index, this.length, this.stable);
  }
  public delete(index: number): T {
    const value = this.array.value(index);
    this.del(this.array.position(index));
    return value;
  }
  public update(index: number, order: O, value?: T): void;
  public update(index: number, order: O, value?: T): void {
    const ord = this.array.order(index);
    assert([order = order!]);
    if (arguments.length < 3) {
      this.array.setOrder(index, order);
    }
    else {
      this.array.setOrder(index, order);
      this.array.setValue(index, value!);
    }
    if (this.cmp(ord, order) === 0) return;
    sort(this.cmp, this.array, index, this.length, this.stable);
  }
  public clear(): void {
    this.array.clear();
  }
}

function sort<T, O>(
  cmp: (a: O, b: O) => number,
  array: List<T, O>,
  index: number,
  length: number,
  stable: boolean,
): boolean {
  if (length === 0) return false;
  switch (index) {
    case 0:
      return false
        || downHeapify(cmp, array, index + 1, length, stable);
    case length - 1:
      return upHeapify(cmp, array, index + 1);
    default:
      return upHeapify(cmp, array, index + 1)
        || downHeapify(cmp, array, index + 1, length, stable);
  }
}

function upHeapify<T, O>(
  cmp: (a: O, b: O) => number,
  array: List<T, O>,
  index: number,
): boolean {
  const order = array.order(array.index(index - 1));
  let changed = false;
  while (index > 1) {
    const parent = index / 2 | 0;
    if (cmp(array.order(array.index(parent - 1)), order) <= 0) break;
    swap(array, index - 1, parent - 1);
    index = parent;
    changed ||= true;
  }
  return changed;
}

function downHeapify<T, O>(
  cmp: (a: O, b: O) => number,
  array: List<T, O>,
  index: number,
  length: number,
  stable: boolean,
): boolean {
  let changed = false;
  while (index < length) {
    const left = index * 2;
    const right = index * 2 + 1;
    let min = index;
    if (left <= length) {
      const result = cmp(array.order(array.index(left - 1)), array.order(array.index(min - 1)));
      if (stable ? result <= 0 : result < 0) {
        min = left;
      }
    }
    if (right <= length) {
      const result = cmp(array.order(array.index(right - 1)), array.order(array.index(min - 1)));
      if (stable ? result <= 0 : result < 0) {
        min = right;
      }
    }
    if (min === index) break;
    swap(array, index - 1, min - 1);
    index = min;
    changed ||= true;
  }
  return changed;
}

function swap<T, O>(array: List<T, O>, index1: number, index2: number): void {
  array.swap(index1, index2);
}

class List<T, O> {
  constructor(
    deletion: boolean,
  ) {
    this.indexes = new Uint32Array(this.capacity);
    if (deletion) {
      this.positions = new Uint32Array(this.capacity);
    }
    this.orders = Array(this.capacity);
    this.values = Array(this.capacity);
  }
  private capacity = 4;
  private ix = new Index();
  private indexes: Uint32Array;
  private positions?: Uint32Array;
  private orders: O[];
  private values: T[];
  private $length = 0;
  public get length() {
    return this.$length;
  }
  public index(pos: number): number {
    return this.indexes[pos];
  }
  public position(index: number): number {
    return this.positions![index];
  }
  public order(index: number): O {
    return this.orders[index];
  }
  public value(index: number): T {
    return this.values[index];
  }
  private isFull() {
    return this.$length === this.capacity;
  }
  private resize(capacity: number): void {
    if (capacity >= 2 ** 32) throw new Error(`Too large capacity`);
    if (capacity > this.indexes.length) {
      const indexes = new Uint32Array(max(capacity, min(this.capacity * 2, 2 ** 32 - 1)));
      indexes.set(this.indexes);
      this.indexes = indexes;
      if (this.positions) {
        const positions = new Uint32Array(max(capacity, min(this.capacity * 2, 2 ** 32 - 1)));
        positions.set(this.positions);
        this.positions = positions;
      }
    }
    this.capacity = capacity;
  }
  public clear(): void {
    this.ix.clear();
    this.indexes = new Uint32Array(this.capacity);
    this.positions &&= new Uint32Array(this.capacity);
    this.orders = Array(this.capacity);
    this.values = Array(this.capacity);
    this.$length = 0;
  }
  public setValue(index: number, value: T): void {
    this.values[index] = value;
  }
  public setOrder(index: number, order: O): void {
    this.orders[index] = order;
  }
  public push(value: T, order: O): number {
    this.isFull() && this.resize(this.length * 2 % 2 ** 32);
    const index = this.indexes[this.$length++] = this.ix.pop();
    if (this.positions) {
      this.positions[index] = this.$length - 1;
    }
    this.values[index] = value;
    this.orders[index] = order;
    return index;
  }
  public pop(): void {
    if (this.$length === 0) return;
    const index = this.indexes[--this.$length];
    this.ix.push(index);
    this.values[index] = undefined as any;
    this.orders[index] = undefined as any;
  }
  public swap(pos1: number, pos2: number): boolean {
    if (pos1 === pos2) return false;
    const { indexes, positions } = this;
    const idx1 = indexes[pos1];
    const idx2 = indexes[pos2];
    indexes[pos1] = idx2;
    indexes[pos2] = idx1;
    if (positions) {
      assert(positions[idx1] === pos1);
      assert(positions[idx2] === pos2);
      positions[idx1] = pos2;
      positions[idx2] = pos1;
    }
    return true;
  }
  public *[Symbol.iterator](): Iterator<[O, T, number], undefined, undefined> {
    if (this.$length === 0) return;
    for (let i = 0; i < this.$length; ++i) {
      const index = this.indexes[i];
      yield [this.orders[index], this.values[index], i];
    }
  }
}

type MultiNode<T> = InvList.Node<T>;

// 1e6要素で落ちるため実用不可
export namespace MultiHeap {
  export type Node<T, O = T> = InvList.Node<T> | { _: [T, O]; };
  export interface Options {
    deletion?: boolean;
    clean?: boolean;
  }
}
export class MultiHeap<T, O = T> {
  private static readonly order = Symbol('order');
  private static readonly heap = Symbol('heap');
  public static readonly max = Heap.max;
  public static readonly min = Heap.min;
  constructor(
    private readonly cmp: (a: O, b: O) => number = MultiHeap.max,
    options?: MultiHeap.Options,
  ) {
    this.clean = options?.clean ?? true;
    this.heap = new Heap(this.cmp, options);
  }
  private readonly clean: boolean;
  private readonly heap: Heap<InvList<T>, O>;
  private readonly dict = new Map<O, InvList<T>>();
  private readonly list = memoize<O, InvList<T>>(order => {
    const list = new InvList<T>();
    list[MultiHeap.order] = order;
    list[MultiHeap.heap] = this.heap.insert(list, order);
    return list;
  }, this.dict);
  private $length = 0;
  public get length(): number {
    return this.$length;
  }
  public isEmpty(): boolean {
    return this.heap.isEmpty();
  }
  public peek(): T | undefined {
    return this.heap.peek()?.head!.value;
  }
  public insert(this: MultiHeap<T, T>, value: T): MultiHeap.Node<T, O>;
  public insert(value: T, order: O): MultiHeap.Node<T, O>;
  public insert(value: T, order?: O): MultiNode<T> {
    if (arguments.length < 2) {
      order = value as any;
    }
    assert([order = order!]);
    ++this.$length;
    return this.list(order).push(value);
  }
  public extract(): T | undefined {
    if (this.$length === 0) return;
    --this.$length;
    const list = this.heap.peek()!;
    const value = list.shift();
    if (list.length === 0) {
      this.heap.extract();
      this.clean && this.dict.delete(list[MultiHeap.order]);
    }
    return value;
  }
  public delete(node: MultiHeap.Node<T, O>): T;
  public delete(node: MultiNode<T>): T {
    const list = node.list;
    if (!list) throw new Error('Invalid node');
    --this.$length;
    if (list.length === 1) {
      this.heap.delete(list[MultiHeap.heap]);
      this.clean && this.dict.delete(list[MultiHeap.order]);
    }
    return node.delete();
  }
  public update(this: MultiHeap<T, T>, node: MultiHeap.Node<T, O>): MultiHeap.Node<T, O>;
  public update(node: MultiHeap.Node<T, O>, order: O, value?: T): MultiHeap.Node<T, O>;
  public update(node: MultiNode<T>, order?: O, value?: T): MultiHeap.Node<T, O> {
    const list = node.list;
    if (!list) throw new Error('Invalid node');
    if (arguments.length < 2) {
      order = list[MultiHeap.order];
    }
    assert([order = order!]);
    if (arguments.length > 2) {
      node.value = value!;
    }
    if (this.cmp(list[MultiHeap.order], order) === 0) return node;
    this.delete(node);
    return this.insert(node.value, order);
  }
  public find(order: O): InvList<T> | undefined {
    return this.dict.get(order);
  }
  public clear(): void {
    this.heap.clear();
    this.dict.clear();
    this.$length = 0;
  }
}
