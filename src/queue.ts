import type { Node } from './list/list';

const undefined = void 0;

const sentinel = [] as unknown;

export class Queue<T> {
  constructor() {
    const node = [sentinel] as Node<T>;
    this.edges = [node, node];
  }
  private edges: [Node<T>, Node<T>];
  public enqueue(value: T): void {
    const edges = this.edges;
    const node = edges[1];
    node[0] = value;
    edges[1] = node[1] = [sentinel] as Node<T>;
  }
  public dequeue(): T | undefined {
    const edges = this.edges;
    const node = edges[0];
    const value = node[0];
    if (value === sentinel) return;
    edges[0] = node[1]!;
    node[1] = undefined;
    return value;
  }
  public isEmpty(): boolean {
    return this.edges[0][0] === sentinel;
  }
  public peek(): T | undefined {
    const value = this.edges[0][0];
    if (value === sentinel) return;
    return value;
  }
}
