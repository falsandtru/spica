import {WeakMap} from './weakmap';

export class WeakSet<K extends Object, V> {
  constructor(private replacer?: (oldVal: V, newVal: V) => V) {
  }
  private store = new WeakMap<K, V>();
  public get(key: K): V {
    return this.store.get(key);
  }
  public add(key: K, val: V): V {
    if (!this.has(key)) return this.store.set(key, val);
    if (!this.replacer) throw new Error('spica: WeakSet: Cannot overwrite value of set without replacer.');
    return this.store.set(key, this.replacer(this.get(key), val));
  }
  public has(key: K): boolean {
    return this.store.has(key);
  }
  public delete(key: K): void {
    void this.store.delete(key);
  }
}
