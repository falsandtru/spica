import { Array } from './global';

const size = 16;

export class Stack<T> {
  private array = Array<T | undefined>(size);
  private index = 0;
  public get length(): number {
    return this.index;
  }
  public isEmpty(): boolean {
    return this.index === 0;
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
  public peek(index: 0 | -1 = 0): T | undefined {
    return index === 0
      ? this.array[(this.index || 1) - 1]
      : this.array[0];
  }
  public clear(): void {
    this.array = Array(size);
    this.index = 0;
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    while (!this.isEmpty()) {
      yield this.pop()!;
    }
    return;
  }
}
