import { Collection } from '../collection';
import { MList } from '../list';

export class MultiMap<K, V> implements Collection<K, V> {
  constructor(
    entries: Iterable<[K, V]> = [],
    private readonly store: Collection<K, MList<V>> = new Map(),
  ) {
    for (const [k, v] of entries) {
      void this.set(k, v);
    }
  }
  public get(key: K): V | undefined {
    return this.store.get(key)?.head;
  }
  public take(key: K, count: number): MList<V> {
    const vs = this.store.get(key);
    return vs?.take(count) || MList();
  }
  public ref(key: K): MList<V> {
    return this.store.get(key) || MList();
  }
  public set(key: K, val: V): this {
    const list = this.store.get(key) || (list => this.store.set(key, list) && list)(MList<V>());
    list.prepend(val);
    return this;
  }
  public has(key: K): boolean {
    return this.store.has(key);
  }
  public delete(key: K): boolean {
    return this.store.delete(key);
  }
}
