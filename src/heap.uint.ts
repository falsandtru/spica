import { Object } from './global';
import { splice } from './array';

// Min heap

type Node<T> = [priority: number, value: T];

export namespace Heap {
  export type Node<T> = readonly unknown[] | { _: T; };
}
export class Heap<T> {
  private dict: Record<number, Node<T>[]> = Object.create(null);
  private $length = 0;
  public get length(): number {
    return this.$length;
  }
  public insert(priority: number, value: T): Heap.Node<T> {
    const dict = this.dict;
    const node: Node<T> = [priority, value];
    (dict[priority] ??= []).push(node);
    ++this.$length;
    return node;
  }
  public extract(): T | undefined {
    const dict = this.dict;
    for (const priority in dict) {
      const queue = dict[priority];
      assert(queue.length > 0);
      const node = queue.shift()!;
      queue.length === 0 && delete dict[priority];
      --this.$length;
      return node[1];
    }
  }
  public delete(node: Heap.Node<T>): T;
  public delete(node: Node<T>): T {
    const dict = this.dict;
    const priority = node[0];
    const queue = dict[priority];
    if (!queue) throw new Error('Invalid node');
    const i = queue.indexOf(node);
    if (i === -1) throw new Error('Invalid node');
    splice(queue, i, 1);
    queue.length === 0 && delete dict[priority];
    --this.$length;
    return node[1];
  }
  public update(node: Heap.Node<T>, priority: number, value?: T): void;
  public update(node: Node<T>, priority: number, value: T = node[1]): void {
    const dict = this.dict;
    if (node[0] === priority) {
      node[1] = value;
    }
    else {
      this.delete(node);
      node[0] = priority;
      (dict[priority] ??= []).push(node);
      ++this.$length;
    }
  }
  public peek(): T | undefined {
    const dict = this.dict;
    for (const priority in dict) return dict[priority][0][1];
  }
  public clear(): void {
    this.dict = Object.create(null);
    this.$length = 0;
  }
}
