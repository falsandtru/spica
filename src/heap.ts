import { floor } from './alias';

// Max heap

const undefined = void 0;

type Node<T> = [priority: number, value: T, index: number];

export namespace Heap {
  export type Node<T> = readonly unknown[] | { _: T; };
}
export class Heap<T> {
  constructor(private readonly stable = false) {
  }
  private array: Node<T>[] = [];
  private $length = 0;
  public get length(): number {
    return this.$length;
  }
  public insert(priority: number, value: T): Heap.Node<T> {
    const array = this.array;
    const node = array[this.$length] = [priority, value, this.$length++];
    upHeapify(array, this.$length);
    return node;
  }
  public replace(priority: number, value: T): T | undefined {
    const array = this.array;
    if (this.$length === 0) return void this.insert(priority, value);
    const replaced = array[0][1];
    array[0] = [priority, value, 0];
    downHeapify(array, 1, this.$length, this.stable);
    return replaced;
  }
  public extract(): T | undefined {
    if (this.$length === 0) return;
    const node = this.array[0];
    this.delete(node);
    return node[1];
  }
  public delete(node: Heap.Node<T>): T;
  public delete(node: Node<T>): T {
    const array = this.array;
    const index = node[2];
    if (array[index] !== node) throw new Error('Invalid node');
    swap(array, index, --this.$length);
    // @ts-expect-error
    array[this.$length] = undefined;
    index < this.$length && this.sort(array[index]);
    if (array.length >= 2 ** 16 && array.length >= this.$length * 2) {
      array.splice(array.length / 2, array.length / 2);
    }
    return node[1];
  }
  public update(node: Heap.Node<T>, priority: number, value?: T): void;
  public update(node: Node<T>, priority: number, value: T = node[1]): void {
    const array = this.array;
    if (array[node[2]] !== node) throw new Error('Invalid node');
    node[1] = value;
    if (node[0] === priority) return;
    node[0] = priority;
    this.sort(node);
  }
  private sort(node: Heap.Node<T>): boolean;
  private sort(node: Node<T>): boolean {
    const array = this.array;
    assert(array[node[2]] === node);
    return upHeapify(array, node[2] + 1)
      || downHeapify(array, node[2] + 1, this.$length, this.stable);
  }
  public peek(): T | undefined {
    return this.array[0]?.[1];
  }
  public clear(): void {
    this.array = [];
    this.$length = 0;
  }
}

function upHeapify<T>(array: Node<T>[], index: number): boolean {
  const priority = array[index - 1][0];
  let changed = false;
  while (index > 1) {
    const parent = floor(index / 2);
    if (array[parent - 1][0] >= priority) break;
    swap(array, index - 1, parent - 1);
    index = parent;
    changed ||= true;
  }
  return changed;
}

function downHeapify<T>(array: Node<T>[], index: number, length: number, stable: boolean): boolean {
  let changed = false;
  while (index < length) {
    const left = index * 2;
    const right = index * 2 + 1;
    let max = index;
    if (left <= length &&
        (stable
          ? array[left - 1][0] >= array[max - 1][0]
          : array[left - 1][0] >  array[max - 1][0])) {
      max = left;
    }
    if (right <= length &&
        (stable
          ? array[right - 1][0] >= array[max - 1][0]
          : array[right - 1][0] >  array[max - 1][0])) {
      max = right;
    }
    if (max === index) break;
    swap(array, index - 1, max - 1);
    index = max;
    changed ||= true;
  }
  return changed;
}

function swap<T>(array: Node<T>[], index1: number, index2: number): void {
  if (index1 === index2) return;
  const node1 = array[index1];
  const node2 = array[index2];
  node1[2] = index2;
  node2[2] = index1;
  array[index1] = node2;
  array[index2] = node1;
}
