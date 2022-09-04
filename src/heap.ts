import { Array } from './global';
import { floor } from './alias';

// Min heap

const undefined = void 0;

type Node<T, O> = [order: O, value: T, index: number];

let size = 16;
assert([size = 0]);

export namespace Heap {
  export type Node<T, O = T> = readonly unknown[] | { _: [T, O]; };
}
export class Heap<T, O = T> {
  constructor(
    private readonly cmp = (a: O, b: O): number => a > b ? 1 : a < b ? -1 : 0,
    private readonly stable = false,
  ) {
  }
  private array: Node<T, O>[] = Array(size);
  private $length = 0;
  public get length(): number {
    return this.$length;
  }
  public insert(this: Heap<T, T>, value: T): Heap.Node<T, O>;
  public insert(value: T, order: O): Heap.Node<T, O>;
  public insert(value: T, order: O = value as any): Heap.Node<T, O> {
    const array = this.array;
    const node = array[this.$length] = [order, value, this.$length++];
    upHeapify(array, this.cmp, this.$length);
    return node;
  }
  public replace(this: Heap<T, T>, value: T): T | undefined;
  public replace(value: T, order: O): T | undefined;
  public replace(value: T, order: O = value as any): T | undefined {
    const array = this.array;
    if (this.$length === 0) return void this.insert(value, order);
    const replaced = array[0][1];
    array[0] = [order, value, 0];
    downHeapify(array, this.cmp, 1, this.$length, this.stable);
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
    index < this.$length && this.sort(array[index]);
    return node[1];
  }
  public update(this: Heap<T, T>, node: Heap.Node<T, O>): void;
  public update(node: Heap.Node<T, O>, order: O, value?: T): void;
  public update(node: Node<T, O>, order: O = node[1] as any, value: T = node[1]): void {
    const array = this.array;
    if (array[node[2]] !== node) throw new Error('Invalid node');
    node[1] = value;
    if (this.cmp(node[0], node[0] = order) === 0) return;
    this.sort(node);
  }
  private sort(node: Heap.Node<T, O>): boolean;
  private sort(node: Node<T, O>): boolean {
    const array = this.array;
    assert(array[node[2]] === node);
    return upHeapify(array, this.cmp, node[2] + 1)
      || downHeapify(array, this.cmp, node[2] + 1, this.$length, this.stable);
  }
  public peek(): T | undefined {
    return this.array[0]?.[1];
  }
  public clear(): void {
    this.array = Array(size);
    this.$length = 0;
  }
}

function upHeapify<T, U>(array: Node<T, U>[], cmp: (a: U, b: U) => number, index: number): boolean {
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

function downHeapify<T, U>(array: Node<T, U>[], cmp: (a: U, b: U) => number, index: number, length: number, stable: boolean): boolean {
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

function swap<T, U>(array: Node<T, U>[], index1: number, index2: number): void {
  if (index1 === index2) return;
  const node1 = array[index1];
  const node2 = array[index2];
  node1[2] = index2;
  node2[2] = index1;
  array[index1] = node2;
  array[index2] = node1;
}
