const space = Object.freeze(Array<undefined>(100));

export class Queue<T> {
  private array: (T | undefined)[] = [];
  private head = 0;
  private tail = 0;
  public enqueue(value: T): void {
    return this.push(value)
  }
  public dequeue(): T | undefined {
    return this.shift();
  }
  public clear(): void {
    this.array = [];
    this.head = this.tail = 0;
  }
  public isEmpty(): boolean {
    return this.head === this.tail;
  }
  public peek(index: 0 | -1 = 0): T | undefined {
    switch (index) {
      case 0:
        return this.array[(this.head || 1) - 1];
      case -1:
        return this.array[(this.tail || 1) - 1];
      default:
        throw new Error(`Spica: Queue: Index must be 0 or -1`);
    }
  }
  public push(value: T): void {
    const array = this.array;
    let { head, tail } = this;
    tail = this.tail = next(tail, head, tail, array.length);
    head = this.head ||= tail;
    if (head === tail && this.length !== 0) {
      array.splice(tail - 1, 0, ...space);
      head = this.head += space.length;
    }
    array[tail - 1] = value;
    ++this.length;
  }
  public unshift(value: T): void {
    const array = this.array;
    let { head, tail } = this;
    head = this.head = prev(head, head, tail, array.length);
    tail = this.tail ||= head;
    if (head === tail && this.length !== 0) {
      array.splice(head, 0, ...space);
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
  public length = 0;
  public toArray(): T[] {
    return this.head <= this.tail
      ? this.array.slice((this.head || 1) - 1, this.tail) as T[]
      : this.array.slice((this.head || 1) - 1).concat(this.array.slice(0, this.tail)) as T[];
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    while (!this.isEmpty()) {
      yield this.dequeue()!;
    }
    return;
  }
}

function next(cursor: number, head: number, tail: number, length: number): number {
  switch (cursor) {
    case 0:
      return 1;
    case head:
      return head === length
          && tail !== 1
        ? 1
        : head + 1;
    case tail:
      return tail === length
          && head !== 1
        ? 1
        : tail + 1;
  }
  throw new Error('Unreachable');
}

function prev(cursor: number, head: number, tail: number, length: number): number {
  switch (cursor) {
    case 0:
      return 1;
    case head:
      return head === 1
        ? tail === length
          ? length + 1
          : length
        : head - 1;
    case tail:
      return tail === 1
        ? head === length
          ? length + 1
          : length
        : tail - 1;
  }
  throw new Error('Unreachable');
}
