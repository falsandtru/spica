import { Array } from './global';

const capacity = 2048;
const initcap = 16;

export class Queue<T> {
  private head = new FixedQueue<T>(Array(initcap));
  private tail = this.head;
  private count = 0;
  public get length(): number {
    return this.count === 0
      ? this.tail.length
      : this.tail.length + this.head.length + capacity * (this.count - 1);
  }
  public isEmpty(): boolean {
    return this.tail.isEmpty();
  }
  public push(value: T): void {
    if (this.tail.isFull()) {
      this.tail = this.tail.next = new FixedQueue(Array(capacity));
      ++this.count;
    }
    this.tail.push(value);
  }
  public pop(): T | undefined {
    const head = this.head;
    const value = head.pop();
    if (head.isEmpty() && head.next) {
      --this.count;
      this.head = head.next;
    }
    return value;
  }
  public peek(index: 0 | -1 = 0): T | undefined {
    return index === 0
      ? this.head.peek(0)
      : this.tail.peek(-1);
  }
  public clear(): void {
    this.head = this.tail = new FixedQueue(Array(initcap));
    this.count = 0;
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    while (!this.isEmpty()) {
      yield this.pop()!;
    }
    return;
  }
}

class FixedQueue<T> {
  constructor(
    private array: Array<T | undefined>,
    public next: FixedQueue<T> | undefined = void 0,
  ) {
    assert((this.array.length & this.array.length - 1) === 0);
  }
  private mask = this.array.length - 1;
  private head = 0;
  private tail = 0;
  public get length(): number {
    return this.tail >= this.head
      ? this.tail - this.head
      : this.array.length - this.head + this.tail;
  }
  public isEmpty(): boolean {
    return this.tail === this.head;
  }
  public isFull(): boolean {
    return (this.tail + 1 & this.mask) === this.head;
  }
  public push(value: T): void {
    this.array[this.tail] = value;
    this.tail = this.tail + 1 & this.mask;
  }
  public pop(): T | undefined {
    if (this.isEmpty()) return;
    const value = this.array[this.head];
    this.array[this.head] = void 0;
    this.head = this.head + 1 & this.mask;
    return value;
  }
  public peek(index: 0 | -1 = 0): T | undefined {
    return index === 0
      ? this.array[this.head]
      : this.array[this.tail - 1 & this.mask];
  }
}
