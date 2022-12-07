import { List } from './list';
import { memoize } from './memoize';

// Max heap

interface Node<T, O> {
  index: number;
  order: O;
  value: T;
}

let size = 16;
assert([size = 0]);

export namespace Heap {
  export interface Options {
    stable?: boolean;
  }
  export interface Node<T, O = T> {
    readonly order: O;
    value: T;
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
  public peek(): Heap.Node<T, O> | undefined {
    return this.array[0];
  }
  public insert(this: Heap<T, T>, value: T): Heap.Node<T, O>;
  public insert(value: T, order: O): Heap.Node<T, O>;
  public insert(value: T, order?: O): Heap.Node<T, O> {
    if (arguments.length === 1) {
      order = value as any;
    }
    assert([order = order!]);
    const array = this.array;
    const node = array[this.$length] = {
      index: ++this.$length,
      order,
      value,
    };
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
    const node = array[0];
    const val = node.value;
    node.order = order;
    node.value = value;
    downHeapify(this.cmp, array, 1, this.$length, this.stable);
    return val;
  }
  public extract(): T | undefined {
    if (this.$length === 0) return;
    const node = this.array[0];
    this.delete(node);
    return node.value;
  }
  public delete(node: Heap.Node<T, O>): T;
  public delete(node: Node<T, O>): T {
    const array = this.array;
    const index = node.index;
    if (array[index - 1] !== node) throw new Error('Invalid node');
    swap(array, index, this.$length--);
    sort(this.cmp, array, index, this.$length, this.stable);
    array[this.$length] = undefined as any;
    return node.value;
  }
  public update(this: Heap<T, T>, node: Heap.Node<T, O>): void;
  public update(node: Heap.Node<T, O>, order: O, value?: T): void;
  public update(node: Node<T, O>, order?: O, value?: T): void {
    const array = this.array;
    const index = node.index;
    if (array[index - 1] !== node) throw new Error('Invalid node');
    if (arguments.length === 1) {
      order = node.order;
    }
    assert([order = order!]);
    if (arguments.length >= 3) {
      node.value = value!;
    }
    if (this.cmp(node.order, node.order = order) === 0) return;
    sort(this.cmp, array, index, this.$length, this.stable);
  }
  public clear(): void {
    this.array = Array(size);
    this.$length = 0;
  }
}

function sort<T, O>(
  cmp: (a: O, b: O) => number,
  array: Record<number, Node<T, O>>,
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
  array: Record<number, Node<T, O>>,
  index: number,
): boolean {
  assert(index);
  const order = array[index - 1].order;
  let changed = false;
  while (index > 1) {
    const parent = index / 2 | 0;
    if (cmp(array[parent - 1].order, order) <= 0) break;
    swap(array, index, parent);
    index = parent;
    changed ||= true;
  }
  return changed;
}

function downHeapify<T, O>(
  cmp: (a: O, b: O) => number,
  array: Record<number, Node<T, O>>,
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
      const result = cmp(array[left - 1].order, array[min - 1].order);
      if (stable ? result <= 0 : result < 0) {
        min = left;
      }
    }
    if (right <= length) {
      const result = cmp(array[right - 1].order, array[min - 1].order);
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

function swap<T, O>(array: Record<number, Node<T, O>>, index1: number, index2: number): void {
  assert(index1 && index2);
  if (index1 === index2) return;
  const pos1 = index1 - 1;
  const pos2 = index2 - 1;
  const node1 = array[pos1];
  const node2 = array[pos2];
  array[pos1] = node2;
  array[pos2] = node1;
  node1.index = index2;
  node2.index = index1;
}

class MList<T, O> extends List<MNode<T, O>> {
  constructor(
    public readonly order: O,
    heap: Heap<MList<T, O>, O>,
  ) {
    super();
    this.heap = heap.insert(this, order);
  }
  public readonly heap: Heap.Node<MList<T, O>, O>;
}
class MNode<T, O> implements List.Node {
  constructor(
    public list: MList<T, O>,
    public order: O,
    public value: T,
  ) {
  }
  public next?: this = undefined;
  public prev?: this = undefined;
}


// 1e6要素で落ちるため実用不可
export namespace MultiHeap {
  export interface Node<T, O = T> {
    readonly order: O;
    value: T;
  }
  export interface Options {
    clean?: boolean;
  }
}
export class MultiHeap<T, O = T> {
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
  private readonly heap: Heap<MList<T, O>, O>;
  private readonly dict = new Map<O, MList<T, O>>();
  private readonly list = memoize<O, MList<T, O>>(order => {
    return new MList<T, O>(order, this.heap);
  }, this.dict);
  private $length = 0;
  public get length(): number {
    return this.$length;
  }
  public isEmpty(): boolean {
    return this.heap.isEmpty();
  }
  public peek(): MultiHeap.Node<T, O> | undefined {
    return this.heap.peek()?.value.head;
  }
  public insert(this: MultiHeap<T, T>, value: T): MultiHeap.Node<T, O>;
  public insert(value: T, order: O): MultiHeap.Node<T, O>;
  public insert(value: T, order?: O): MNode<T, O> {
    if (arguments.length === 1) {
      order = value as any;
    }
    assert([order = order!]);
    ++this.$length;
    const node = new MNode(this.list(order), order, value);
    node.list.push(node);
    return node;
  }
  public extract(): T | undefined {
    if (this.$length === 0) return;
    --this.$length;
    const list = this.heap.peek()?.value!;
    const value = list.shift()!.value;
    if (list.length === 0) {
      this.heap.extract();
      this.clean && this.dict.delete(list.order);
    }
    return value;
  }
  public delete(node: MultiHeap.Node<T, O>): T;
  public delete(node: MNode<T, O>): T {
    if (node.next === undefined) throw new Error('Invalid node');
    const list = node.list;
    --this.$length;
    if (list.length === 1) {
      this.heap.delete(list.heap);
      this.clean && this.dict.delete(list.order);
    }
    return list.delete(node).value;
  }
  public update(node: MultiHeap.Node<T, O>, order: O, value?: T): MultiHeap.Node<T, O>;
  public update(node: MNode<T, O>, order?: O, value?: T): MultiHeap.Node<T, O> {
    const list = node.list;
    if (list === undefined) throw new Error('Invalid node');
    assert([order = order!]);
    if (arguments.length >= 3) {
      node.value = value!;
    }
    if (this.cmp(list.order, order) === 0) return node;
    this.delete(node);
    return this.insert(node.value, order);
  }
  public clear(): void {
    this.heap.clear();
    this.dict.clear();
    this.$length = 0;
  }
}
