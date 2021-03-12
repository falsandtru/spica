import type { List } from './list/list';

// Note: Generally much slower than arrays.

const undefined = void 0;

export class Stack<T> {
  private list: List<T[]> = undefined;
  public length = 0;
  public push(value: T): void {
    const node = this.list;
    const values = node?.[0];
    ++this.length;
    !values || values.length === 100
      ? this.list = [[value], node]
      : values.push(value);
  }
  public pop(): T | undefined {
    const node = this.list;
    if (node === undefined) return;
    const values = node[0];
    //assert(values.length > 0);
    --this.length;
    if (values.length !== 1) return values.pop();
    const value = values[0];
    this.list = node[1];
    node[1] = undefined;
    return value;
  }
  public clear(): void {
    this.list = undefined;
  }
  public isEmpty(): boolean {
    return this.list === undefined;
  }
  public peek(): T | undefined {
    return this.list?.[0][0];
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    while (!this.isEmpty()) {
      yield this.pop()!;
    }
    return;
  }
}
