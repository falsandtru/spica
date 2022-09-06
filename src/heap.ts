import { Array } from './global';
import { floor } from './alias';
import { List } from './invlist';
import { memoize } from './memoize';

// Max heap

const undefined = void 0;

type Node<T, O> = [order: O, value: T, index: number];

let size = 16;
assert([size = 0]);

export namespace Heap {
  export type Node<T, O = T> = readonly unknown[] | { _: [T, O]; };
}
export class Heap<T, O = T> {
  public static readonly max = <O>(a: O, b: O): number => a > b ? -1 : a < b ? 1 : 0;
  public static readonly min = <O>(a: O, b: O): number => a > b ? 1 : a < b ? -1 : 0;
  constructor(
    private readonly cmp: (a: O, b: O) => number = Heap.max,
    private readonly stable = false,
  ) {
  }
  private array: Node<T, O>[] = Array(size);
  private $length = 0;
  public get length(): number {
    return this.$length;
  }
  public isEmpty(): boolean {
    return this.$length === 0;
  }
  public peek(): T | undefined {
    return this.array[0]?.[1];
  }
  public insert(this: Heap<T, T>, value: T): Heap.Node<T, O>;
  public insert(value: T, order: O): Heap.Node<T, O>;
  public insert(value: T, order: O = value as any): Heap.Node<T, O> {
    const array = this.array;
    const node = array[this.$length] = [order, value, this.$length++];
    upHeapify(this.cmp, array, this.$length);
    return node;
  }
  public replace(this: Heap<T, T>, value: T): T | undefined;
  public replace(value: T, order: O): T | undefined;
  public replace(value: T, order: O = value as any): T | undefined {
    if (this.$length === 0) return void this.insert(value, order);
    const array = this.array;
    const replaced = array[0][1];
    array[0] = [order, value, 0];
    downHeapify(this.cmp, array, 1, this.$length, this.stable);
    return replaced;
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
    if (array[index] !== node) throw new Error('Invalid node');
    swap(array, index, --this.$length);
    // @ts-expect-error
    array[this.$length] = undefined;
    index < this.$length && sort(this.cmp, array, index, this.$length, this.stable);
    return node[1];
  }
  public update(this: Heap<T, T>, node: Heap.Node<T, O>): void;
  public update(node: Heap.Node<T, O>, order: O, value?: T): void;
  public update(node: Node<T, O>, order: O = node[0] as any, value?: T): void {
    const array = this.array;
    if (array[node[2]] !== node) throw new Error('Invalid node');
    if (arguments.length > 2) {
      node[1] = value!;
    }
    if (this.cmp(node[0], node[0] = order) === 0) return;
    sort(this.cmp, array, node[2], this.$length, this.stable);
  }
  public clear(): void {
    this.array = Array(size);
    this.$length = 0;
  }
}

type MultiNode<T, O> = readonly [order: O, node: List.Node<T>, node: Heap.Node<readonly [List<T>, O], O>];

export namespace MultiHeap {
  export type Node<T, O = T> = Heap.Node<T, O>;
}
export class MultiHeap<T, O = T> {
  public static readonly max = Heap.max;
  public static readonly min = Heap.min;
  constructor(
    private readonly cmp: (a: O, b: O) => number = MultiHeap.max,
  ) {
  }
  private readonly heap = new Heap<readonly [List<T>, O], O>(this.cmp);
  private readonly dict = new Map<O, readonly [List<T>, Heap.Node<readonly [List<T>, O], O>]>();
  private readonly list = memoize<O, readonly [List<T>, Heap.Node<readonly [List<T>, O], O>]>(order => {
    const list = new List<T>();
    return [list, this.heap.insert([list, order], order)];
  }, this.dict);
  private $length = 0;
  public get length(): number {
    return this.$length;
  }
  public isEmpty(): boolean {
    return this.$length === 0;
  }
  public peek(): T | undefined {
    return this.heap.peek()?.[0].last!.value;
  }
  public insert(this: Heap<T, T>, value: T): MultiHeap.Node<T, O>;
  public insert(value: T, order: O): MultiHeap.Node<T, O>;
  public insert(value: T, order: O = value as any): MultiHeap.Node<T, O> {
    ++this.$length;
    const { 0: list, 1: node } = this.list(order);
    return [order, list.push(value), node];
  }
  public extract(): T | undefined {
    if (this.$length === 0) return;
    --this.$length;
    const { 0: list, 1: order } = this.heap.peek()!;
    const value = list.pop();
    if (list.length === 0) {
      this.heap.extract();
      this.dict.delete(order);
    }
    return value;
  }
  public delete(node: MultiHeap.Node<T, O>): T;
  public delete(node: MultiNode<T, O>): T {
    --this.$length;
    const { 0: order, 1: lnode, 2: hnode } = node;
    if (lnode.list.length === 1) {
      this.heap.delete(hnode);
      this.dict.delete(order);
    }
    return lnode.delete();
  }
  public update(this: MultiHeap<T, T>, node: MultiHeap.Node<T, O>): MultiHeap.Node<T, O>;
  public update(node: MultiHeap.Node<T, O>, order: O, value?: T): MultiHeap.Node<T, O>;
  public update(node: MultiNode<T, O>, order: O = node[0] as any, value?: T): MultiHeap.Node<T, O> {
    value = arguments.length > 2
      ? node[1].value = value!
      : node[1].value;
    if (this.cmp(node[0], order) === 0) return node;
    this.delete(node);
    return this.insert(value, order);
  }
  public clear(): void {
    this.heap.clear();
    this.dict.clear();
  }
}

function sort<T, O>(
  cmp: (a: O, b: O) => number,
  array: Node<T, O>[],
  index: number,
  length: number,
  stable: boolean,
): boolean {
  return upHeapify(cmp, array, index + 1)
    || downHeapify(cmp, array, index + 1, length, stable);
}

function upHeapify<T, O>(
  cmp: (a: O, b: O) => number,
  array: Node<T, O>[],
  index: number,
): boolean {
  const order = array[index - 1][0];
  let changed = false;
  while (index > 1) {
    const parent = floor(index / 2);
    if (cmp(array[parent - 1][0], order) <= 0) break;
    swap(array, index - 1, parent - 1);
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
  let changed = false;
  while (index < length) {
    const left = index * 2;
    const right = index * 2 + 1;
    let min = index;
    if (left <= length &&
        (stable
          ? cmp(array[left - 1][0], array[min - 1][0]) <= 0
          : cmp(array[left - 1][0], array[min - 1][0]) < 0)) {
      min = left;
    }
    if (right <= length &&
        (stable
          ? cmp(array[right - 1][0], array[min - 1][0]) <= 0
          : cmp(array[right - 1][0], array[min - 1][0]) < 0)) {
      min = right;
    }
    if (min === index) break;
    swap(array, index - 1, min - 1);
    index = min;
    changed ||= true;
  }
  return changed;
}

function swap<T, O>(array: Node<T, O>[], index1: number, index2: number): void {
  if (index1 === index2) return;
  const node1 = array[index1];
  const node2 = array[index2];
  node1[2] = index2;
  node2[2] = index1;
  array[index1] = node2;
  array[index2] = node1;
}
