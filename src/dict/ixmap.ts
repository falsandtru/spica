import { Array, Map } from '../global';
import { IterableDict } from '../dict';
import { Index } from '../index';

export class IxMap<K, V> implements IterableDict<K, V> {
  private readonly index = new Index();
  private indexes = new Map<K, number>();
  private values: V[] = Array(16);
  public get size(): number {
    return this.indexes.size;
  }
  public has(key: K): boolean {
    return this.indexes.has(key);
  }
  public get(key: K): V | undefined {
    return this.values[this.indexes.get(key) ?? this.values.length];
  }
  public set(key: K, value: V): this {
    let index = this.indexes.get(key) ?? -1;
    if (index === -1) {
      index = this.index.pop();
      this.indexes.set(key, index);
    }
    this.values[index] = value;
    return this;
  }
  public delete(key: K, index?: number): boolean {
    index ??= this.indexes.get(key) ?? -1;
    if (index === -1) return false;
    this.index.push(index);
    this.values[index] = void 0 as V;
    return this.indexes.delete(key);
  }
  public clear(): void {
    this.index.clear();
    this.indexes = new Map();
    this.values = Array(16);
  }
  public *[Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    for (const { 0: key, 1: i } of this.indexes) {
      yield [key, this.values[i]];
    }
    return;
  }
}
