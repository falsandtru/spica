import { Array } from './global';
import { max, min } from './alias';
import { indexOf, splice } from './array';

const undefined = void 0;

type empty = typeof empty;
const empty = Symbol('empty');
const unempty = <T>(value: T | empty): T | undefined =>
  value === empty ? undefined : value;
const space = Object.freeze(Array<empty>(100).fill(empty));
let size = 16;
assert([size = 0]);

export class Ring<T> {
  private array: (T | empty)[] = Array(size);
  private head = 0;
  private tail = 0;
  private $length = 0;
  public get length(): number {
    return this.$length;
  }
  public at(index: number): T | undefined {
    // Inline the code for optimization.
    const array = this.array;
    if (index >= 0) {
      if (index >= this.$length) return;
      return unempty(array[(this.head - 1 + index) % array.length]);
    }
    else {
      if (-index > this.$length) return;
      return this.tail + index >= 0
        ? unempty(array[this.tail + index])
        : unempty(array[array.length + this.tail + index]);
    }
  }
  public set(index: number, value: T, replacer?: (oldValue: T, newValue: T) => T): T {
    const array = this.array;
    if (index >= 0) {
      if (index >= this.$length) throw new RangeError('Invalid index');
      index = (this.head - 1 + index) % array.length;
    }
    else {
      if (-index > this.$length) throw new RangeError('Invalid index');
      index = this.tail + index >= 0
        ? this.tail + index
        : array.length + this.tail + index;
    }
    const val = unempty(array[index])!;
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
    if (head === tail && this.$length !== 0) {
      splice(array, tail - 1, 0, ...space);
      head = this.head += space.length;
    }
    array[tail - 1] = value;
    ++this.$length;
  }
  public unshift(value: T): void {
    const array = this.array;
    let { head, tail } = this;
    head = this.head = prev(head, tail, array.length);
    tail = this.tail ||= head;
    if (head === tail && this.$length !== 0) {
      splice(array, head, 0, ...space);
      head = this.head += space.length;
    }
    array[head - 1] = value;
    ++this.$length;
  }
  public pop(): T | undefined {
    if (this.$length === 0) return;
    const array = this.array;
    const i = this.tail - 1;
    const value = unempty(array[i]);
    array[i] = empty;
    --this.$length === 0
      ? this.head = this.tail = 0
      : this.tail = this.tail === 1
        ? array.length
        : this.tail - 1;
    return value;
  }
  public shift(): T | undefined {
    if (this.$length === 0) return;
    const array = this.array;
    const i = this.head - 1;
    const value = unempty(array[i]);
    array[i] = empty;
    --this.$length === 0
      ? this.head = this.tail = 0
      : this.head = this.head === array.length
        ? 1
        : this.head + 1;
    return value;
  }
  private excess = 0;
  public splice(index: number, count: number, ...values: T[]): T[] {
    const array = this.array;
    if (this.excess > 100 && array.length - this.$length > 200) {
      splice(array, 0, 100 - splice(array, this.tail, 100).length);
      this.excess -= 100;
    }
    else if (-this.excess > array.length * 2) {
      this.excess = array.length;
    }
    index = index < 0
      ? max(0, this.$length + index)
      : index <= this.$length
        ? index
        : this.$length;
    count = min(max(count, 0), this.$length - index);
    if (values.length === 0) {
      if (count === 0) return [];
      switch (index) {
        case 0:
          if (count === 1) return [this.shift()!];
          break;
        case this.$length - 1:
          if (count === 1) return [this.pop()!];
          break;
        case this.$length:
          return [];
      }
    }
    index = (this.head || 1) - 1 + index;
    index = index > array.length
      ? index % array.length
      : index;
    this.excess += values.length - count;
    this.$length += values.length - count;
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
    this.$length = this.head = this.tail = 0;
  }
  public includes(value: T): boolean {
    return this.array.includes(value);
  }
  private relational(index: number): number {
    if (index === -1) return -1;
    return index + 1 >= this.head
      ? index + 1 - this.head
      : this.array.length - this.head + index;
  }
  public indexOf(value: T): number {
    return this.relational(indexOf(this.array, value));
  }
  public findIndex(f: (value: T) => unknown): number {
    return this.relational(this.array.findIndex(value => value !== empty && f(value)));
  }
  public find(f: (value: T) => unknown): T | undefined {
    return unempty(this.array.find(value => value !== empty && f(value)));
  }
  public toArray(): T[] {
    return this.head <= this.tail
      ? this.array.slice((this.head || 1) - 1, this.tail) as T[]
      : this.array.slice((this.head || 1) - 1).concat(this.array.slice(0, this.tail)) as T[];
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    for (let i = 0; i < this.$length; ++i) {
      yield this.at(i)!;
    }
    return;
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
