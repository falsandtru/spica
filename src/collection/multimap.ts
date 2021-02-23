import { Map } from '../global';
import { IterableCollection } from '../collection';
import { splice } from '../array';

export class MultiMap<K, V> implements IterableCollection<K, V> {
  constructor(
    entries: Iterable<[K, V]> = [],
    private store: IterableCollection<K, V[]> | Map<K, V[]> = new Map(),
  ) {
    for (const [k, v] of entries) {
      this.set(k, v);
    }
  }
  public get(key: K): V | undefined {
    return this.store.get(key)?.[0];
  }
  public set(key: K, val: V): this {
    this.store.get(key)?.push(val) ?? this.store.set(key, [val]);
    return this;
  }
  public has(key: K): boolean {
    return this.store.get(key)?.length! > 0;
  }
  public delete(key: K): boolean {
    return this.store.delete(key);
  }
  public clear(): void {
    'clear' in this.store
      ? this.store.clear()
      : this.store = new Map();
  }
  public take(key: K): V | undefined;
  public take(key: K, count: number): V[];
  public take(key: K, count?: number): V | undefined | V[] {
    const vs = this.store.get(key) ?? [];
    return count === void 0
      ? splice(vs, 0, 1)[0]
      : splice(vs, 0, count);
  }
  public ref(key: K): V[] {
    let vs = this.store.get(key);
    if (vs) return vs;
    vs = [];
    this.store.set(key, vs);
    return vs;
  }
  public *[Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    for (const [k, vs] of this.store) {
      for (let i = 0; i < vs.length; ++i) {
        yield [k, vs[i]];
      }
    }
    return;
  }
}
