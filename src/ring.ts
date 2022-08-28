const space = Object.freeze(Array<undefined>(100));

export class Ring<T> {
  private array: (T | undefined)[] = [];
  private head = 0;
  private tail = 0;
  public length = 0;
  public at(index: number): T | undefined {
    const array = this.array;
    if (index >= 0) {
      if (index >= this.length) return;
      return array[this.head + index % array.length - 1];
    }
    else {
      if (-index > this.length) return;
      return this.tail + index > 0
        ? array[this.tail + index]
        : array[array.length + this.tail + index - 1];
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
  public clear(): void {
    this.array = [];
    this.head = this.tail = 0;
  }
  public toArray(): T[] {
    return this.head <= this.tail
      ? this.array.slice((this.head || 1) - 1, this.tail) as T[]
      : this.array.slice((this.head || 1) - 1).concat(this.array.slice(0, this.tail)) as T[];
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
