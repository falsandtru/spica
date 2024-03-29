export class Stack<T> {
  private array: T[] = [];
  public get length(): number {
    return this.array.length;
  }
  public isEmpty(): boolean {
    return this.array.length === 0;
  }
  public peek(index: 0 | -1 = 0): T | undefined {
    return index === 0
      ? this.array.at(-1)
      : this.array[0];
  }
  public push(value: T): void {
    this.array.push(value);
  }
  public pop(): T | undefined {
    return this.array.pop();
  }
  public clear(): void {
    this.array = [];
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    while (!this.isEmpty()) {
      yield this.pop()!;
    }
  }
}
