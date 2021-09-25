// Max heap

const undefined = void 0;

interface Array<T> {
  [i: number]: [priority: number, value: T];
  length: number;
}

export class Heap<T> {
  private array: Array<T> = { length: 0 };
  public get length(): number {
    return this.array.length;
  }
  public insert(priority: number, value: T): void {
    const array = this.array;
    array[array.length++] = [priority, value];
    upHeapify(array, priority);
  }
  public extract(): T | undefined {
    const array = this.array;
    if (array.length === 0) return;
    const value = array[0][1];
    array[0] = array[--array.length];
    // @ts-expect-error
    array[array.length] = undefined;
    downHeapify(array);
    return value;
  }
  public replace(priority: number, value: T): T | undefined {
    const array = this.array;
    if (array.length === 0) return void this.insert(priority, value);
    const result = array[0][1];
    array[0] = [priority, value];
    downHeapify(array);
    return result;
  }
  public peek(): T | undefined {
    const array = this.array;
    return array.length === 0
      ? undefined
      : array[0][1];
  }
}

function upHeapify<T>(array: Array<T>, priority: number): void {
  let index = array.length;
  while (index > 1) {
    const parent = index / 2 | 0;
    if (array[parent - 1][0] >= priority) break;
    [array[parent - 1], array[index - 1]] = [array[index - 1], array[parent - 1]];
    index = parent;
  }
}

function downHeapify<T>(array: Array<T>): void {
  const length = array.length;
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
