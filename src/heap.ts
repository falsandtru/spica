// Max heap

const LENGTH = Symbol('length');

export class Heap<T = undefined> {
  private array: [number, T][] = [];
  private [LENGTH] = 0;
  public get length(): number {
    return this[LENGTH];
  }
  public insert(priority: number, value: T): void {
    const array = this.array;
    this.length < array.length
      ? array[this[LENGTH]] = [priority, value]
      : array.push([priority, value]);
    upHeapify(array, priority, ++this[LENGTH]);
  }
  public extract(): T | undefined {
    if (this.length === 0) return;
    const array = this.array;
    const value = array[0][1];
    array[0] = array[this.length - 1];
    // @ts-expect-error
    array[this.length - 1] = void 0;
    downHeapify(array, --this[LENGTH]);
    return value;
  }
  public replace(priority: number, value: T): T | undefined {
    if (this.length === 0) return void this.insert(priority, value);
    const array = this.array;
    const result = array[0][1];
    array[0] = [priority, value];
    downHeapify(array, this.length);
    return result;
  }
  public peek(): T | undefined {
    return this.length === 0
      ? void 0
      : this.array[0][1];
  }
}

function upHeapify<T>(array: [number, T][], priority: number, index: number): void {
  while (index > 1) {
    const parent = index / 2 | 0;
    if (array[parent - 1][0] >= priority) break;
    [array[parent - 1], array[index - 1]] = [array[index - 1], array[parent - 1]];
    index = parent;
  }
}

function downHeapify<T>(array: [number, T][], length: number): void {
  for (let index = 1; index < length;) {
    const left = index * 2;
    const right = index * 2 + 1;
    let max = index;
    if (left <= length && array[left - 1][0] >= array[max - 1][0]) {
      max = left;
    }
    if (right <= length && array[right - 1][0] >= array[max - 1][0]) {
      max = right;
    }
    if (max === index) break;
    [array[index - 1], array[max - 1]] = [array[max - 1], array[index - 1]];
    index = max;
  }
}
