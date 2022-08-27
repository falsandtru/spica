const space = Object.freeze(Array<undefined>(100));

export class Queue<T> {
  private array: (T | undefined)[] = [];
  private head = 0;
  private tail = 0;
  public enqueue(value: T): void {
    if (this.length === 0 && this.head !== 0) {
      this.head = this.tail = 0;
    }
    const array = this.array;
    const i = this.head++;
    if (this.length !== 0 && this.head === this.tail) {
      array.splice(i, 0, ...space);
      this.tail += space.length;
    }
    else {
      this.tail ||= this.head;
    }
    array[i] = value;
    ++this.length;
  }
  public dequeue(): T | undefined {
    if (this.length === 0) return;
    if (this.tail < this.head) {
      this.head = this.tail - 1;
    }
    const array = this.array;
    const i = this.tail++ - 1;
    const value = array[i];
    array[i] = void 0;
    if (this.tail === array.length + 1) {
      this.tail = this.length && 1;
    }
    --this.length;
    return value;
  }
  public clear(): void {
    this.array = [];
    this.head = this.tail = 0;
  }
  public isEmpty(): boolean {
    return this.head === this.tail;
  }
  public length = 0;
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    while (!this.isEmpty()) {
      yield this.dequeue()!;
    }
    return;
  }
}
