import { floor } from './alias';

// Max heap

const undefined = void 0;

export class Heap<T> {
  private array: [priority: number, value: T][] = [];
  private $length = 0;
  public get length(): number {
    return this.$length;
  }
  public insert(priority: number, value: T): void {
    const array = this.array;
    array[this.$length++] = [priority, value];
    upHeapify(array, this.$length, priority);
  }
  public extract(): T | undefined {
    const array = this.array;
    if (this.$length === 0) return;
    const value = array[0][1];
    array[0] = array[--this.$length];
    // @ts-expect-error
    array[this.$length] = undefined;
    downHeapify(array, this.$length);
    if (array.length > 2 ** 16 && array.length > this.$length * 2) {
      array.splice(array.length / 2, array.length)
    }
    return value;
  }
  public replace(priority: number, value: T): T | undefined {
    const array = this.array;
    if (this.$length === 0) return void this.insert(priority, value);
    const result = array[0][1];
    array[0] = [priority, value];
    downHeapify(array, this.$length);
    return result;
  }
  public peek(): T | undefined {
    const array = this.array;
    return this.$length === 0
      ? undefined
      : array[0][1];
  }
}

function upHeapify<T>(array: T[], length: number, priority: number): void {
  let index = length;
  while (index > 1) {
    const parent = floor(index / 2);
    if (array[parent - 1][0] >= priority) break;
    [array[parent - 1], array[index - 1]] = [array[index - 1], array[parent - 1]];
    index = parent;
  }
}

function downHeapify<T>(array: T[], length: number): void {
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
