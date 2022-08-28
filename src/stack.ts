export class Stack<T> {
  private array: (T | undefined)[] = [];
  public length = 0;
  public push(value: T): void {
    this.array[this.length++] = value;
  }
  public pop(): T | undefined {
    if (this.length === 0) return;
    const array = this.array;
    const i = --this.length;
    const value = array[i];
    array[i] = void 0;
    return value;
  }
  public peek(): T | undefined {
    return this.array[(this.length || 1) - 1];
  }
  public isEmpty(): boolean {
    return this.length === 0;
  }
  public clear(): void {
    this.array = [];
  }
  public toArray(): T[] {
    return this.array.slice(0, this.length) as T[];
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    while (!this.isEmpty()) {
      yield this.pop()!;
    }
    return;
  }
}
