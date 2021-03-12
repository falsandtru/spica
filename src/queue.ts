import type { Node } from './list/list';

const undefined = void 0;

const sentinel = [] as unknown;

export class Queue<T> {
  constructor() {
    const node = [sentinel, undefined] as Node<T>;
    this.edges = [node, node];
  }
  private readonly edges: [Node<T>, Node<T>];
  public length = 0;
  public enqueue(value: T): void {
    const edges = this.edges;
    const node = edges[1];
    node[0] = value;
    edges[1] = node[1] = [sentinel, undefined] as Node<T>;
    ++this.length;
  }
  public dequeue(): T | undefined {
    const edges = this.edges;
    const node = edges[0];
    const value = node[0];
    if (value === sentinel) return;
    edges[0] = node[1]!;
    node[1] = undefined;
    --this.length;
    return value;
  }
  public clear(): void {
    this.edges[0] = this.edges[1];
  }
  public isEmpty(): boolean {
    return this.edges[0][0] === sentinel;
  }
  public peek(): T | undefined {
    const value = this.edges[0][0];
    if (value === sentinel) return;
    return value;
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    while (!this.isEmpty()) {
      yield this.dequeue()!;
    }
    return;
  }
}
