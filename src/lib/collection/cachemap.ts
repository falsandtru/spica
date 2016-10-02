import {WeakMapLike} from 'spica';

let time = Date.now();
void setInterval(() => time = Date.now(), 100);

export class CacheMap<K, V> implements WeakMapLike<K, V> {
  constructor(entries: Iterable<[K, V]> = []) {
    void Array.from(entries)
      .forEach(([k, v]) =>
        void this.set(k, v));
  }
  private readonly store = new Map<K, [typeof time, V]>();
  private clean(key: K) {
    if (this.store.has(key) && this.store.get(key)![0] < time) {
      void this.store.delete(key);
    }
  }
  public get(key: K): V | undefined {
    void this.clean(key);
    return (this.store.get(key) || <[number, undefined]>[0, void 0])[1];
  }
  public set(key: K, val: V, expiry = Infinity): this {
    void this.clean(key);
    void this.store.set(key, [time + expiry, val]);
    return this;
  }
  public has(key: K): boolean {
    void this.clean(key);
    return this.store.has(key);
  }
  public delete(key: K): boolean {
    void this.clean(key);
    return this.store.delete(key);
  }
  public clear(): void {
    return this.store.clear();
  }
  public get size(): number {
    return this.store.size;
  }
}
