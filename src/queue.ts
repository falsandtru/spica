// 1-10,000x faster than Array.

export class Queue<T> {
  private buffer: (T | undefined)[] = [];
  private queue: (T | undefined)[] = [];
  private index = 0;
  private head = 0;
  private tail = 0;
  public length = 0;
  public push(value: T): void {
    this.buffer[this.index++] = value;
    ++this.length;
  }
  public pop(): T | undefined {
    if (this.length === 0) return;
    --this.length;
    if (this.head === this.tail) {
      const { buffer, queue } = this;
      this.queue = buffer;
      this.buffer = queue;
      this.tail = this.index;
      this.index = this.head = 0;
    }
    const value = this.queue[this.head];
    this.queue[this.head++] = void 0;
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
    this.buffer = [];
    this.queue = [];
    this.length = this.index = this.head = this.tail = 0;
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
