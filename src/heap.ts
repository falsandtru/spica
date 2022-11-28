import { List } from './list';
import { memoize } from './memoize';

// Max heap

type Node<T, O> = [order: O, value: T, index: number];

let size = 16;
assert([size = 0]);

export namespace Heap {
  export interface Options {
    stable?: boolean;
  }
  export type Node<T, O = T> = object | [T, O];
}
export class Heap<T, O = T> {
  public static readonly max = <O>(a: O, b: O): number => a > b ? -1 : a < b ? 1 : 0;
  public static readonly min = <O>(a: O, b: O): number => a > b ? 1 : a < b ? -1 : 0;
  constructor(
    private readonly cmp: (a: O, b: O) => number = Heap.max,
    options?: Heap.Options,
  ) {
    this.stable = options?.stable ?? false;
  }
  private readonly stable: boolean;
  private array: Node<T, O>[] = Array(size);
  private $length = 0;
  public get length(): number {
    return this.$length;
  }
  public isEmpty(): boolean {
    return this.array[0] !== undefined;
  }
  public peek(): T | undefined {
    return this.array[0]?.[1];
  }
  public insert(this: Heap<T, T>, value: T): Heap.Node<T, O>;
  public insert(value: T, order: O): Heap.Node<T, O>;
  public insert(value: T, order?: O): Heap.Node<T, O> {
    if (arguments.length === 1) {
      order = value as any;
    }
    assert([order = order!]);
    const array = this.array;
    const node = array[this.$length] = [order, value, ++this.$length];
    upHeapify(this.cmp, array, this.$length);
    return node;
  }
  public replace(this: Heap<T, T>, value: T): T | undefined;
  public replace(value: T, order: O): T | undefined;
  public replace(value: T, order?: O): T | undefined {
    if (arguments.length === 1) {
      order = value as any;
    }
    assert([order = order!]);
    if (this.$length === 0) return void this.insert(value, order);
    const array = this.array;
    const old = array[0][1];
    array[0] = [order, value, 1];
    downHeapify(this.cmp, array, 1, this.$length, this.stable);
    return old;
  }
  public extract(): T | undefined {
    if (this.$length === 0) return;
    const node = this.array[0];
    this.delete(node);
    return node[1];
  }
  public delete(node: Heap.Node<T, O>): T;
  public delete(node: Node<T, O>): T {
    const array = this.array;
    const index = node[2];
    if (array[index - 1] !== node) throw new Error('Invalid node');
    swap(array, index, this.$length--);
    sort(this.cmp, array, index, this.$length, this.stable);
    array[this.$length] = undefined as any;
    return node[1];
  }
  public update(this: Heap<T, T>, node: Heap.Node<T, O>): void;
  public update(node: Heap.Node<T, O>, order: O, value?: T): void;
  public update(node: Node<T, O>, order?: O, value?: T): void {
    const array = this.array;
    const index = node[2];
    if (array[index - 1] !== node) throw new Error('Invalid node');
    if (arguments.length === 1) {
      order = node[0];
    }
    assert([order = order!]);
    if (arguments.length >= 3) {
      node[1] = value!;
    }
    if (this.cmp(node[0], node[0] = order) === 0) return;
    sort(this.cmp, array, index, this.$length, this.stable);
  }
  public clear(): void {
    this.array = Array(size);
    this.$length = 0;
  }
}

function sort<T, O>(
  cmp: (a: O, b: O) => number,
  array: Node<T, O>[],
  index: number,
  length: number,
  stable: boolean,
): boolean {
  assert(index);
  if (length === 0) return false;
  switch (index) {
    case 1:
      return false
        || downHeapify(cmp, array, index, length, stable);
    case length:
      return upHeapify(cmp, array, index);
    default:
      return upHeapify(cmp, array, index)
        || downHeapify(cmp, array, index, length, stable);
  }
}

function upHeapify<T, O>(
  cmp: (a: O, b: O) => number,
  array: Node<T, O>[],
  index: number,
): boolean {
  assert(index);
  const order = array[index - 1][0];
  let changed = false;
  while (index > 1) {
    const parent = index / 2 | 0;
    if (cmp(array[parent - 1][0], order) <= 0) break;
    swap(array, index, parent);
    index = parent;
    changed ||= true;
  }
  return changed;
}

function downHeapify<T, O>(
  cmp: (a: O, b: O) => number,
  array: Node<T, O>[],
  index: number,
  length: number,
  stable: boolean,
): boolean {
  assert(index);
  let changed = false;
  while (index < length) {
    const left = index * 2;
    const right = index * 2 + 1;
    let min = index;
    if (left <= length) {
      const result = cmp(array[left - 1][0], array[min - 1][0]);
      if (stable ? result <= 0 : result < 0) {
        min = left;
      }
    }
    if (right <= length) {
      const result = cmp(array[right - 1][0], array[min - 1][0]);
      if (stable ? result <= 0 : result < 0) {
        min = right;
      }
    }
    if (min === index) break;
    swap(array, index, min);
    index = min;
    changed ||= true;
  }
  return changed;
}

function swap<T, O>(array: Node<T, O>[], index1: number, index2: number): void {
  assert(index1 && index2);
  if (index1 === index2) return;
  const pos1 = index1 - 1;
  const pos2 = index2 - 1;
  const node1 = array[pos1];
  const node2 = array[pos2];
  array[pos1] = node2;
  array[pos2] = node1;
  node1[2] = index2;
  node2[2] = index1;
}

class MultiNode<T> extends List.Node {
  constructor(
    public list: List<MultiNode<T>>,
    public value: T,
  ) {
    super();
  }
}


// 1e6要素で落ちるため実用不可
export namespace MultiHeap {
  export type Node<T, O = T> = object | [T, O];
  export interface Options {
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
    this.heap = new Heap(this.cmp);
  }
  private readonly clean: boolean;
  private readonly heap: Heap<List<MultiNode<T>>, O>;
  private readonly dict = new Map<O, List<MultiNode<T>>>();
  private readonly list = memoize<O, List<MultiNode<T>>>(order => {
    const list = new List<MultiNode<T>>();
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
    if (arguments.length === 1) {
      order = value as any;
    }
    assert([order = order!]);
    ++this.$length;
    const node = new MultiNode(this.list(order), value);
    node.list.push(node);
    return node;
  }
  public extract(): T | undefined {
    if (this.$length === 0) return;
    --this.$length;
    const list = this.heap.peek()!;
    const value = list.shift()!.value;
    if (list.length === 0) {
      this.heap.extract();
      this.clean && this.dict.delete(list[MultiHeap.order]);
    }
    return value;
  }
  public delete(node: MultiHeap.Node<T, O>): T;
  public delete(node: MultiNode<T>): T {
    if (node.next === undefined) throw new Error('Invalid node');
    const list = node.list;
    --this.$length;
    if (list.length === 1) {
      this.heap.delete(list[MultiHeap.heap]);
      this.clean && this.dict.delete(list[MultiHeap.order]);
    }
    return list.delete(node).value;
  }
  public update(node: MultiHeap.Node<T, O>, order: O, value?: T): MultiHeap.Node<T, O>;
  public update(node: MultiNode<T>, order?: O, value?: T): MultiHeap.Node<T, O> {
    const list = node.list;
    if (list === undefined) throw new Error('Invalid node');
    assert([order = order!]);
    if (arguments.length >= 3) {
      node.value = value!;
    }
    if (this.cmp(list[MultiHeap.order], order) === 0) return node;
    this.delete(node);
    return this.insert(node.value, order);
  }
  public find(order: O): List<MultiNode<T>> | undefined {
    return this.dict.get(order);
  }
  public clear(): void {
    this.heap.clear();
    this.dict.clear();
    this.$length = 0;
  }
}
