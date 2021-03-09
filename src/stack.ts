const undefined = void 0;

interface Memory<T> {
  [i: number]: T | undefined;
  length: number;
}

export class Stack<T> {
  private memory: Memory<T> = { length: 0 };
  public push(value: T): void {
    const mem = this.memory;
    mem[mem.length++] = value;
  }
  public pop(): T | undefined {
    const mem = this.memory;
    if (mem.length === 0) return undefined;
    const value = mem[--mem.length];
    mem[mem.length] = undefined;
    return value;
  }
  public clear(): void {
    this.memory = { length: 0 };
  }
  public get length(): number {
    return this.memory.length;
  }
  public peek(): T | undefined {
    const mem = this.memory;
    return mem[mem.length - 1];
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    const mem = this.memory;
    while (mem.length !== 0) {
      yield this.pop()!;
    }
    return;
  }
}
