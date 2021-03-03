// Max heap

const LENGTH = Symbol('length');

export class Heap<T = undefined> {
  private array: [number, T][] = [];
  private [LENGTH] = 0;
  public add(priority: number, value: T): number {
    const { array } = this;
    this[LENGTH] < array.length
      ? array[this[LENGTH]] = [priority, value]
      : array.push([priority, value]);
    for (let index = ++this[LENGTH]; index > 1;) {
      const parent = index / 2 | 0;
      if (array[parent - 1][0] >= priority) break;
      [array[parent - 1], array[index - 1]] = [array[index - 1], array[parent - 1]];
      index = parent;
    }
    return this[LENGTH];
  }
  public peek(): T | undefined {
    return this.array[0]?.[1];
  }
  public take(): T | undefined {
    const { array } = this;
    if (this[LENGTH] === 0) return;
    const value = array[0]?.[1];
    array[0] = array[this[LENGTH] - 1];
    for (let index = 1, len = --this[LENGTH]; index < len;) {
      const left = index * 2;
      const right = index * 2 + 1;
      let max = index;
      if (left <= len && array[left - 1][0] >= array[max - 1][0]) {
        max = left;
      }
      if (right <= len && array[right - 1][0] >= array[max - 1][0]) {
        max = right;
      }
      if (max === index) break;
      [array[index - 1], array[max - 1]] = [array[max - 1], array[index - 1]];
      index = max;
    }
    return value;
  }
  public get length(): number {
    return this[LENGTH];
  }
}
