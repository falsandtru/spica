import { Object } from './global';
import { List } from './invlist';

// Min heap

type Node<T> = [priority: number, value: List.Node<T>];

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
    for (const priority in dict) return dict[priority][0][1];
  }
  public insert(priority: number, value: T): Heap.Node<T> {
    const dict = this.dict;
    const list = dict[priority] ??= new List();
    const node: Node<T> = [priority, list.push(value)];
    ++this.$length;
    return node;
  }
  public extract(): T | undefined {
    const dict = this.dict;
    for (const priority in dict) {
      const queue = dict[priority];
      assert(queue.length > 0);
      const node = queue.shift();
      queue.length === 0 && delete dict[priority];
      --this.$length;
      return node;
    }
  }
  public delete(node: Heap.Node<T>): T;
  public delete(node: Node<T>): T {
    const dict = this.dict;
    const priority = node[0];
    const queue = dict[priority];
    if (!queue) throw new Error('Invalid node');
    node[1].delete();
    queue.length === 0 && delete dict[priority];
    --this.$length;
    return node[1].value;
  }
  public update(node: Heap.Node<T>, priority: number, value?: T): void;
  public update(node: Node<T>, priority: number, value: T): void {
    const dict = this.dict;
    if (node[0] === priority) {
      node[1].value = value;
    }
    else {
      this.delete(node);
      node[0] = priority;
      const list = dict[priority] ??= new List();
      list.push(value);
      ++this.$length;
    }
  }
  public clear(): void {
    this.dict = Object.create(null);
    this.$length = 0;
  }
}
