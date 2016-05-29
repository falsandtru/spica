import {DataMap} from './datamap';

export class DataSet<K extends Array<string | number>, V> {
  constructor(private replacer?: (oldVal: V, newVal: V) => V) {
  }
  private store = new DataMap<K, V>();
  public get(key: K): V {
    return this.store.get(key);
  }
  public add(key: K, val: V): V {
    if (!this.has(key)) return this.store.set(key, val);
    if (!this.replacer) throw new Error('spica: Set: Cannot overwrite value of set without replacer.');
    return this.store.set(key, this.replacer(this.get(key), val));
  }
  public has(key: K): boolean {
    return this.store.has(key);
  }
  public delete(key: K): void {
    return void this.store.delete(key);
  }
  public clear(): void {
    return void this.store.clear();
  }
  public get size(): number {
    return this.store.size;
  }
  public entries(): [K, V][] {
    return this.store.entries();
  }
}
