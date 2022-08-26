import type { Node } from './list/list';

// Note: Generally much slower than arrays.

const undefined = void 0;

export class Queue<T> {
  constructor() {
    const node: Node<T[]> = [[], undefined];
    this.edges = [node, node];
  }
  private readonly edges: [Node<T[]>, Node<T[]>];
  public length = 0;
  public enqueue(value: T): void {
    const edges = this.edges;
    const node = edges[1];
    const values = node[0];
    ++this.length;
    values.push(value);
    if (values.length === 100) {
      edges[1] = node[1] = [[], undefined];
    }
  }
  public dequeue(): T | undefined {
    const edges = this.edges;
    const node = edges[0];
    const values = node[0];
    if (values.length === 0) return;
    --this.length;
    if (!node[1] || values.length !== 1) return values.shift();
    edges[0] = node[1];
    node[1] = undefined;
    return values[0];
  }
  public clear(): void {
    this.edges[0] = this.edges[1] = [[], undefined];
  }
  public isEmpty(): boolean {
    return this.edges[0][0].length === 0;
  }
  public peek(): T | undefined {
    return this.edges[0][0][0];
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    while (!this.isEmpty()) {
      yield this.dequeue()!;
    }
    return;
  }
}
