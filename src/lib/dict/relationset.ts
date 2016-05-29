import {WeakSet} from './weakset';
import {WeakMap} from './weakmap';

export class RelationSet<S extends Object, T extends Object, V> {
  constructor(private replacer?: (oldVal: V, newVal: V) => V) {
  }
  private store = new WeakMap<S, WeakSet<T, V>>();
  public get(source: S, target: T): V {
    return this.store.get(source) && this.store.get(source).get(target);
  }
  public add(source: S, target: T, val: V): V {
    return (this.store.get(source) || this.store.set(source, new WeakSet<T, V>(this.replacer)))
      .add(target, val);
  }
  public has(source: S, target: T): boolean {
    return this.store.has(source) && this.store.get(source).has(target);
  }
  public delete(source: S, target?: T): void {
    return target === void 0
      ? this.store.delete(source)
      : this.store.get(source) && this.store.get(source).delete(target);
  }
}
