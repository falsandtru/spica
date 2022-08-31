import { Array } from './global';

const capacity = 2048;
const initcap = 16;

export class Stack<T> {
  private head = new FixedStack<T>(Array(initcap));
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
      this.tail = new FixedStack<T>(Array(capacity), this.tail);
      ++this.count;
    }
    this.tail.push(value);
  }
  public pop(): T | undefined {
    const tail = this.tail;
    const value = tail.pop();
    if (tail.isEmpty() && tail.prev) {
      --this.count;
      this.tail = tail.prev;
    }
    return value;
  }
  public peek(index: 0 | -1 = 0): T | undefined {
    return index === 0
      ? this.tail.peek(0)
      : this.head.peek(-1);
  }
  public clear(): void {
    this.head = this.tail = new FixedStack(Array(initcap));
    this.count = 0;
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    while (!this.isEmpty()) {
      yield this.pop()!;
    }
    return;
  }
}

class FixedStack<T> {
  constructor(
    private array: Array<T | undefined>,
    public prev: FixedStack<T> | undefined = void 0,
  ) {
    assert((this.array.length & this.array.length - 1) === 0);
  }
  private mask = this.array.length - 1;
  private tail = 0;
  public get length(): number {
    return this.tail;
  }
  public isEmpty(): boolean {
    return this.tail === 0;
  }
  public isFull(): boolean {
    return this.tail + 1 === this.array.length;
  }
  public push(value: T): void {
    this.array[this.tail++] = value;
  }
  public pop(): T | undefined {
    if (this.isEmpty()) return;
    const value = this.array[--this.tail];
    this.array[this.tail] = void 0;
    return value;
  }
  public peek(index: 0 | -1 = 0): T | undefined {
    return index === 0
      ? this.array[this.tail - 1 & this.mask]
      : this.array[0];
  }
}
