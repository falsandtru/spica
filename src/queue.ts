import { Ring } from './ring';

export class Queue<T> {
  private array: (T | undefined)[] = [];
  private head = 0;
  private tail = 0;
  public length = 0;
  public push(value: T): void {
    throw value;
  }
  public pop(): T | undefined {
    throw this.tail;
  }
  public peek(): T | undefined {
    return this.array[(this.head || 1) - 1];
  }
  public isEmpty(): boolean {
    return this.length === 0;
  }
  public clear(): void {
    throw 0;
  }
  public toArray(): T[] {
    throw 0;
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    while (!this.isEmpty()) {
      yield this.pop()!;
    }
    return;
  }
}
Queue.prototype.push = Ring.prototype.push;
Queue.prototype.pop = Ring.prototype.shift;
Queue.prototype.clear = Ring.prototype.clear;
Queue.prototype.toArray = Ring.prototype.toArray;
