import { Array } from './global';
import { max, min } from './alias';
import { splice } from './array';

const space = Object.freeze(Array<undefined>(100));

let size = 16;
assert([size = 0]);

export class Ring<T> {
  private array: (T | undefined)[] = Array(size);
  private head = 0;
  private tail = 0;
  public length = 0;
  public at(index: number): T | undefined {
    // Inline the code for optimization.
    const array = this.array;
    if (index >= 0) {
      if (index >= this.length) return;
      return array[(this.head - 1 + index) % array.length];
    }
    else {
      if (-index > this.length) return;
      return this.tail + index >= 0
        ? array[this.tail + index]
        : array[array.length - 1 + this.tail + index];
    }
  }
  public replace(index: number, value: T, replacer?: (oldValue: T, newValue: T) => T): T {
    const array = this.array;
    if (index >= 0) {
      if (index >= this.length) throw new RangeError('Invalid index');
      index = (this.head - 1 + index) % array.length;
    }
    else {
      if (-index > this.length) throw new RangeError('Invalid index');
      index = this.tail + index >= 0
        ? this.tail + index
        : array.length - 1 + this.tail + index;
    }
    const val = array[index]!;
    array[index] = replacer
      ? replacer(val, value)
      : value;
    return val;
  }
  public push(value: T): void {
    const array = this.array;
    let { head, tail } = this;
    tail = this.tail = next(head, tail, array.length);
    head = this.head ||= tail;
    if (head === tail && this.length !== 0) {
      splice(array, tail - 1, 0, ...space);
      head = this.head += space.length;
    }
    array[tail - 1] = value;
    ++this.length;
  }
  public unshift(value: T): void {
    const array = this.array;
    let { head, tail } = this;
    head = this.head = prev(head, tail, array.length);
    tail = this.tail ||= head;
    if (head === tail && this.length !== 0) {
      splice(array, head, 0, ...space);
      head = this.head += space.length;
    }
    array[head - 1] = value;
    ++this.length;
  }
  public pop(): T | undefined {
    if (this.length === 0) return;
    const array = this.array;
    const i = this.tail - 1;
    const value = array[i];
    array[i] = void 0;
    --this.length === 0
      ? this.head = this.tail = 0
      : this.tail = this.tail === 1
        ? array.length
        : this.tail - 1;
    return value;
  }
  public shift(): T | undefined {
    if (this.length === 0) return;
    const array = this.array;
    const i = this.head - 1;
    const value = array[i];
    array[i] = void 0;
    --this.length === 0
      ? this.head = this.tail = 0
      : this.head = this.head === array.length
        ? 1
        : this.head + 1;
    return value;
  }
  private excess = 0;
  public splice(index: number, count: number, ...values: T[]): T[] {
    const array = this.array;
    if (this.excess > 100 && array.length - this.length > 200) {
      splice(array, 0, 100 - splice(array, this.tail, 100).length);
      this.excess -= 100;
    }
    else if (-this.excess > array.length * 2) {
      this.excess = array.length;
    }
    index = index < 0
      ? max(0, this.length + index)
      : index <= this.length
        ? index
        : this.length;
    count = min(max(count, 0), this.length - index);
    if (values.length === 0) {
      if (count === 0) return [];
      switch (index) {
        case 0:
          if (count === 1) return [this.shift()!];
          break;
        case this.length - 1:
          if (count === 1) return [this.pop()!];
          break;
        case this.length:
          return [];
      }
    }
    index = (this.head || 1) - 1 + index;
    index = index > array.length
      ? index % array.length
      : index;
    this.excess += values.length - count;
    this.length += values.length - count;
    // |--H>*>T--|
    if (this.head <= this.tail) {
      this.tail += values.length - count;
      return splice(array, index, count, ...values) as T[];
    }
    // |*>T---H>>|
    if (index < this.tail) {
      this.head += values.length - count;
      this.tail += values.length - count;
      return splice(array, index, count, ...values) as T[];
    }
    // |>>T---H>*|
    const cnt = min(count, array.length - index);
    const vs = splice(array, index, cnt, ...splice(values, 0, cnt));
    vs.push(...splice(array, 0, count - vs.length, ...values));
    return vs as T[];
  }
  public clear(): void {
    this.array = Array(size);
    this.length = this.head = this.tail = 0;
  }
  public toArray(): T[] {
    return this.head <= this.tail
      ? this.array.slice((this.head || 1) - 1, this.tail) as T[]
      : this.array.slice((this.head || 1) - 1).concat(this.array.slice(0, this.tail)) as T[];
  }
}

function next(head: number, tail: number, length: number): number {
  return tail === length
      && head !== 1
    ? 1
    : tail + 1;
}

function prev(head: number, tail: number, length: number): number {
  return head === 0
      || head === 1
    ? tail === length
      ? length + 1
      : length
    : head - 1;
}
