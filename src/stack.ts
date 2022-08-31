import { Array } from './global';
import { splice } from './array';

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
  public at(index: number): T | undefined {
    if (-index > this.length) return;
    return index >= 0
      ? this.array[index]
      : this.array[this.index + index];
  }
  private absolute(index: number): number {
    if (index >= 0) {
      if (index >= this.length) throw new RangeError('Invalid index');
      return index;
    }
    else {
      if (-index > this.length) throw new RangeError('Invalid index');
      return this.index + index;
    }
  }
  public replace(index: number, value: T, replacer?: (oldValue: T, newValue: T) => T): T {
    index = this.absolute(index);
    const array = this.array;
    const val = array[index]!;
    array[index] = replacer
      ? replacer(val, value)
      : value;
    return val;
  }
  public delete(index: number): T {
    index = this.absolute(index);
    if (index === 0 && this.length !== 0) return this.pop()!;
    const array = this.array;
    --this.index
    return splice(array, index, 1)[0]!;
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
