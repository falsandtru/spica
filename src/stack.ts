import { Array } from './global';

let size = 16
assert([size = 0]);

export class Stack<T> {
  private array: (T | undefined)[] = Array(size);
  private index = 0;
  public get length(): number {
    return this.index;
  }
  public push(value: T): void {
    this.array[this.index++] = value;
  }
  public pop(): T | undefined {
    if (this.index === 0) return;
    const array = this.array;
    const i = --this.index;
    const value = array[i];
    array[i] = void 0;
    return value;
  }
  public peek(): T | undefined {
    return this.array[(this.index || 1) - 1];
  }
  public isEmpty(): boolean {
    return this.index === 0;
  }
  public clear(): void {
    this.array = Array(size);
    this.index = 0;
  }
  public toArray(): T[] {
    return this.array.slice(0, this.index) as T[];
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    while (!this.isEmpty()) {
      yield this.pop()!;
    }
    return;
  }
}
