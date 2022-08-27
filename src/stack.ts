export class Stack<T> {
  private array: (T | undefined)[] = [];
  public push(value: T): void {
    this.array[this.length++] = value;
  }
  public pop(): T | undefined {
    const array = this.array;
    const i = --this.length;
    const value = array[i];
    array[i] = void 0;
    return value;
  }
  public clear(): void {
    this.array = [];
  }
  public isEmpty(): boolean {
    return this.length === 0;
  }
  public peek(): T | undefined {
    return this.array[(this.length || 1) - 1];
  }
  public length = 0;
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    while (!this.isEmpty()) {
      yield this.pop()!;
    }
    return;
  }
}
