import { IterableCollection } from '../collection';
import { splice } from '../array';

export class MultiMap<K, V> implements IterableCollection<K, V> {
  constructor(
    entries: Iterable<[K, V]> = [],
    private readonly store: IterableCollection<K, V[]> = new Map(),
  ) {
    for (const [k, v] of entries) {
      void this.set(k, v);
    }
  }
  public get(key: K): V | undefined {
    return this.store.get(key)?.[0];
  }
  public set(key: K, val: V): this {
    this.store.get(key)?.push(val) || this.store.set(key, [val]);
    return this;
  }
  public has(key: K): boolean {
    return this.store.has(key);
  }
  public delete(key: K): boolean {
    return this.store.delete(key);
  }
  public take(key: K, count: number): V[] {
    return splice(this.store.get(key) || [], 0, count);
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
