import {Set} from './set';
import {WeakMap} from './weakmap';

export class AttrSet<O extends Object, K extends string | number, V> {
  constructor(private replacer?: (oldVal: V, newVal: V) => V) {
  }
  private store = new WeakMap<O, Set<K, V>>();
  public get(obj: O, key: K): V {
    return this.store.get(obj) && this.store.get(obj).get(key);
  }
  public add(obj: O, key: K, val: V): V {
    return (this.store.get(obj) || this.store.set(obj, new Set<K, V>(this.replacer)))
      .add(key, val);
  }
  public has(obj: O, key: K): boolean {
    return this.store.has(obj) && this.store.get(obj).has(key);
  }
  public delete(obj: O, key?: K): void {
    return key === void 0
      ? this.store.delete(obj)
      : this.store.get(obj) && this.store.get(obj).delete(key);
  }
}
