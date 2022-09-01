import { Array } from './global';

const size = 2048;
const initsize = 16;

export class Queue<T> {
  private head = new FixedQueue<T>(initsize);
  private tail = this.head;
  private count = 0;
  private irregular = 0;
  public get length(): number {
    return this.count === 0
      ? this.head.length
      : this.head.length + this.tail.length + (size - 1) * (this.count - 2) + (this.irregular || size) - 1;
  }
  public isEmpty(): boolean {
    return this.head.isEmpty();
  }
  public push(value: T): void {
    const tail = this.tail;
    if (tail.isFull()) {
      if (tail.next.isEmpty()) {
        if(tail.next.next.isEmpty()) {
          const next = tail.next;
          tail.next = next.next;
          // @ts-expect-error
          next.next = void 0;
        }
        this.tail = tail.next;
      }
      else {
        this.tail = tail.next = new FixedQueue(size, tail.next);
      }
      ++this.count;
      if (tail.size !== size && tail !== this.head) {
        this.irregular = tail.size;
      }
    }
    this.tail.push(value);
  }
  public pop(): T | undefined {
    const head = this.head;
    const value = head.pop();
    if (head.isEmpty() && !head.next.isEmpty()) {
      --this.count;
      this.head = head.next;
      if (this.head.size === this.irregular) {
        this.irregular = 0;
      }
    }
    return value;
  }
  public peek(index: 0 | -1 = 0): T | undefined {
    return index === 0
      ? this.head.peek(0)
      : this.tail.peek(-1);
  }
  public clear(): void {
    this.head = this.tail = new FixedQueue(initsize);
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
    public readonly size: number,
    next?: FixedQueue<T>,
  ) {
    assert((this.array.length & this.array.length - 1) === 0);
    this.next = next ?? this;
  }
  private readonly array = Array<T | undefined>(this.size);
  private readonly mask = this.array.length - 1;
  private head = 0;
  private tail = 0;
  public next: FixedQueue<T>;
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
