import { max, min, isArray } from '../alias';
import { Index } from '../index';

// Circular Indexed List

export class List<T> {
  constructor(
    public capacity: number = 0,
    private readonly Container: ArrayConstructor | Uint32ArrayConstructor = Array,
  ) {
    if (capacity <= 0) {
      capacity = -capacity;
      this.auto = true;
    }
    if (capacity >= 2 ** 32) throw new Error(`Too large capacity`);
    this.capacity ||= 4;
    this.values = new this.Container(this.capacity) as T[];
    this.nexts = new Uint32Array(this.capacity);
    this.prevs = new Uint32Array(this.capacity);
  }
  private readonly auto: boolean = false;
  private values: T[];
  private nexts: Uint32Array;
  private prevs: Uint32Array;
  private readonly ix = new Index();
  private $length = 0;
  public get length() {
    return this.$length;
  }
  public head = 0;
  public get tail(): number {
    return this.nexts[this.head];
  }
  public get last(): number {
    return this.prevs[this.head];
  }
  public next(index: number): number {
    return this.nexts[index];
  }
  public prev(index: number): number {
    return this.prevs[index];
  }
  public at(index: number): T {
    return this.values[index];
  }
  public index(offset: number, index = this.head): number {
    if (offset === 0) return this.nexts[index];
    if (offset > 0) {
      const pointers = this.nexts;
      while (offset-- !== 0) {
        index = pointers[index];
      }
    }
    else {
      const pointers = this.prevs;
      while (offset++ !== 0) {
        index = pointers[index];
      }
    }
    return index;
  }
  public resize(capacity: number): void {
    if (capacity > 2 ** 32) throw new Error(`Too large capacity`);
    if (capacity > this.nexts.length) {
      const size = max(capacity, min(this.capacity * 2, 2 ** 32));
      if (isArray(this.values)) {
        this.values.length = size;
      }
      else {
        const values = new this.Container(size) as Uint32Array;
        values.set(this.values);
        this.values = values as any;
      }
      const nexts = new Uint32Array(size);
      nexts.set(this.nexts);
      this.nexts = nexts;
      const prevs = new Uint32Array(size);
      prevs.set(this.prevs);
      this.prevs = prevs;
    }
    this.capacity = capacity;
    while (this.$length > capacity) {
      this.del(this.last);
    }
  }
  public clear(): void {
    this.values = new this.Container(this.capacity) as T[];
    this.ix.clear();
    this.head = 0;
    this.$length = 0;
  }
  public add(value: T): number {
    const head = this.head;
    if (this.$length === 0) {
      assert(this.length === 0);
      const index = this.head = this.ix.pop();
      ++this.$length;
      this.values[index] = value;
      this.nexts[index] = index;
      this.prevs[index] = index;
      return index;
    }
    if (this.$length !== this.capacity) {
      assert(this.length < this.capacity);
      const index = this.head = this.ix.pop();
      ++this.$length;
      const last = this.prevs[head];
      this.prevs[head] = this.nexts[last] = index;
      this.values[index] = value;
      this.nexts[index] = head;
      this.prevs[index] = last;
      return index;
    }
    else if (!this.auto) {
      assert(this.length === this.capacity);
      assert(this.ix.length === this.capacity);
      const index = this.head = this.prevs[head];
      this.values[index] = value;
      return index;
    }
    else {
      this.resize(max(min(this.capacity * 2, 2 ** 32), this.capacity + 1));
      return this.add(value);
    }
  }
  public del(index: number): void {
    assert(this.length > 0);
    const next = this.nexts[index];
    const prev = this.prevs[index];
    this.ix.push(index);
    this.values[index] = undefined as any;
    if (--this.$length !== 0) {
      this.nexts[prev] = next;
      this.prevs[next] = prev;
    }
    if (index === this.head) {
      this.head = next;
    }
  }
  public set(index: number, value: T): void {
    this.values[index] = value;
  }
  public insert(value: T, before: number): number {
    const head = this.head;
    this.head = before;
    const index = this.add(value);
    this.head = head;
    return index;
  }
  public unshift(value: T): number {
    return this.add(value);
  }
  public unshiftRotationally(value: T): number {
    if (this.$length === 0) return this.add(value);
    const index = this.last;
    this.values[index] = value;
    this.head = index;
    return index;
  }
  public push(value: T): number {
    return this.insert(value, this.head);
  }
  public pushRotationally(value: T): number {
    if (this.$length === 0) return this.add(value);
    const index = this.head;
    this.values[index] = value;
    this.head = this.nexts[index];
    return index;
  }
  public shift(): T | undefined {
    if (this.$length === 0) return;
    const index = this.head;
    const value = this.values[index];
    this.del(index);
    return value;
  }
  public pop(): T | undefined {
    if (this.$length === 0) return;
    const index = this.last;
    const value = this.values[index];
    this.del(index);
    return value;
  }
  public move(index: number, before: number): boolean {
    if (index === before) return false;
    const a1 = index;
    const b1 = before;
    assert(a1 !== b1);
    const { nexts, prevs } = this;
    const a2 = nexts[a1];
    if (a2 === b1) return false;
    const b0 = prevs[b1];
    const a0 = prevs[a1];
    nexts[b0] = a1;
    nexts[a1] = b1;
    prevs[b1] = a1;
    prevs[a1] = b0;
    nexts[a0] = a2;
    prevs[a2] = a0;
    assert(this.length > 10 || [...this].length === this.length);
    return true;
  }
  public moveToHead(index: number): void {
    this.move(index, this.head);
    this.head = index;
  }
  public moveToLast(index: number): void {
    this.move(index, this.head);
    this.head = index === this.head
      ? this.tail
      : this.head;
  }
  public swap(index1: number, index2: number): boolean {
    if (index1 === index2) return false;
    const index3 = this.nexts[index2];
    this.move(index2, index1);
    this.move(index1, index3);
    switch (this.head) {
      case index1:
        this.head = index2;
        break;
      case index2:
        this.head = index1;
        break;
    }
    return true;
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    for (let index = this.head, i = 0; i < this.$length; ++i) {
      yield this.values[index];
      index = this.nexts[index];
    }
    return;
  }
}
