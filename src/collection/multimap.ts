import { Infinity } from '../global';
import { Collection } from '../collection';

export class MultiMap<K, V> implements Collection<K, V> {
  constructor(
    entries: Iterable<[K, V]> = [],
    private readonly store: Collection<K, V[]> = new Map(),
  ) {
    for (const [k, v] of entries) {
      void this.set(k, v);
    }
  }
  public get(key: K): V | undefined {
    return this.store.get(key)?.[0];
  }
  public take(key: K, size: number): V[] {
    const vs = this.store.get(key);
    return vs?.splice(0, size === Infinity ? vs.length : size) || [];
  }
  public ref(key: K): V[] {
    return this.store.get(key) || [];
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
}
