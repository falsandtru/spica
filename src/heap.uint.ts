import { Object } from './global';
import { List } from './invlist';

// Min heap

type Node<T> = [order: number, value: List.Node<T>];

export namespace Heap {
  export type Node<T> = readonly unknown[] | { _: T; };
}
export class Heap<T> {
  private dict: Record<number, List<T>> = Object.create(null);
  private $length = 0;
  public get length(): number {
    return this.$length;
  }
  public isEmpty(): boolean {
    return this.$length === 0;
  }
  public peek(): T | undefined {
    const dict = this.dict;
    for (const order in dict) return dict[order][0][1];
  }
  public insert(value: T, order: number): Heap.Node<T> {
    const dict = this.dict;
    const list = dict[order] ??= new List();
    const node: Node<T> = [order, list.push(value)];
    ++this.$length;
    return node;
  }
  public extract(): T | undefined {
    const dict = this.dict;
    for (const order in dict) {
      const queue = dict[order];
      assert(queue.length > 0);
      const node = queue.shift();
      queue.length === 0 && delete dict[order];
      --this.$length;
      return node;
    }
  }
  public delete(node: Heap.Node<T>): T;
  public delete(node: Node<T>): T {
    const dict = this.dict;
    const order = node[0];
    const queue = dict[order];
    if (!queue) throw new Error('Invalid node');
    node[1].delete();
    queue.length === 0 && delete dict[order];
    --this.$length;
    return node[1].value;
  }
  public update(node: Heap.Node<T>, order: number, value?: T): void;
  public update(node: Node<T>, order: number, value: T): void {
    const dict = this.dict;
    if (node[0] === order) {
      node[1].value = value;
    }
    else {
      this.delete(node);
      node[0] = order;
      const list = dict[order] ??= new List();
      list.push(value);
      ++this.$length;
    }
  }
  public clear(): void {
    this.dict = Object.create(null);
    this.$length = 0;
  }
}
