import { Array } from './global';
import { splice } from './array';

// 1-200,000x faster than Array.

// 'Array queue 1,000,000 x         620 ops/sec ±0.14% (67 runs sampled)'
// 'Ring  queue 1,000,000 x 117,987,767 ops/sec ±0.43% (65 runs sampled)'
// 'Queue       1,000,000 x 142,427,381 ops/sec ±0.46% (66 runs sampled)'

let size = 16
assert([size = 0]);

export class Queue<T> {
  private buffer: (T | undefined)[] = Array(size);
  private queue: (T | undefined)[] = Array(size);
  private index = 0;
  private head = 0;
  private tail = 0;
  public get length(): number {
    return this.index + this.tail - this.head;
  }
  public push(value: T): void {
    this.buffer[this.index++] = value;
  }
  public pop(): T | undefined {
    if (this.length === 0) return;
    let { queue, buffer } = this;
    if (this.head === this.tail) {
      this.buffer = queue;
      this.queue = queue = buffer;
      this.tail = this.index;
      this.index = this.head = 0;
    }
    const value = queue[this.head];
    queue[this.head++] = void 0;
    return value;
  }
  public peek(): T | undefined {
    return this.head === this.tail
      ? this.buffer[0]
      : this.queue[this.head];
  }
  public isEmpty(): boolean {
    return this.length === 0;
  }
  public clear(): void {
    this.buffer = Array(size);
    this.queue = Array(size);
    this.index = this.head = this.tail = 0;
  }
  public at(index: number): T | undefined {
    // Inline the code for optimization.
    if (index >= 0) {
      if (index >= this.length) return;
      return this.head === this.tail
        ? this.buffer[index]
        : this.head + index < this.tail
          ? this.queue[index + this.head]
          : this.buffer[index - (this.tail - this.head)];
    }
    else {
      if (-index > this.length) return;
      return this.index + index >= 0
        ? this.buffer[this.index + index]
        : this.queue[this.tail + this.index + index];
    }
  }
  private target(index: number): [(T | undefined)[], number] {
    if (index >= 0) {
      if (index >= this.length) throw new RangeError('Invalid index');
      return this.head === this.tail
        ? [this.buffer, index]
        : this.head + index < this.tail
          ? [this.queue, index + this.head]
          : [this.buffer, index - (this.tail - this.head)];
    }
    else {
      if (-index > this.length) throw new RangeError('Invalid index');
      return this.index + index >= 0
        ? [this.buffer, this.index + index]
        : [this.queue, this.tail + this.index + index];
    }
  }
  public replace(index: number, value: T, replacer?: (oldValue: T, newValue: T) => T): T {
    const { 0: array, 1: i } = this.target(index);
    const val = array[i]!;
    array[i] = replacer
      ? replacer(val, value)
      : value;
    return val;
  }
  public delete(index: number): T {
    if (index === 0 && this.length !== 0) return this.pop()!;
    const { 0: array, 1: i } = this.target(index);
    array === this.buffer
      ? --this.index
      : --this.tail;
    return splice(array, i, 1)[0]!;
  }
  public toArray(): T[] {
    return this.queue.slice(this.head, this.tail).concat(this.buffer.slice(0, this.index)) as T[];
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    while (!this.isEmpty()) {
      yield this.pop()!;
    }
    return;
  }
}
