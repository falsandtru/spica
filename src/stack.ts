import type { List } from './list/list';

// Note: Generally much slower than arrays.
// Note: Slower than associative arrays a little...

const undefined = void 0;

export class Stack<T> {
  private list: List<T> = undefined;
  public length = 0;
  public push(value: T): void {
    this.list = [value, this.list];
    ++this.length;
  }
  public pop(): T | undefined {
    const node = this.list;
    if (node === undefined) return;
    const value = node[0];
    this.list = node[1];
    node[1] = undefined;
    --this.length;
    return value;
  }
  public clear(): void {
    this.list = undefined;
  }
  public isEmpty(): boolean {
    return this.list === undefined;
  }
  public peek(): T | undefined {
    return this.list?.[0];
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    while (!this.isEmpty()) {
      yield this.pop()!;
    }
    return;
  }
}
