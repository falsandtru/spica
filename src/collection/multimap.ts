import { Map } from '../global';
import { IterableCollection } from '../collection';
import { indexOf, splice } from '../array';

interface Collection<K, V> extends IterableCollection<K, V> {
  clear(): void;
}

export class MultiMap<K, V> implements IterableCollection<K, V> {
  constructor(
    entries: Iterable<[K, V]> = [],
    private memory: Collection<K, V[]> = new Map(),
  ) {
    for (const [k, v] of entries) {
      this.set(k, v);
    }
  }
  public get(key: K): V | undefined {
    return this.memory.get(key)?.[0];
  }
  public set(key: K, val: V): this {
    this.memory.get(key)?.push(val) ?? this.memory.set(key, [val]);
    return this;
  }
  public has(key: K, value?: V): boolean {
    const vs = this.memory.get(key);
    if (!vs || vs.length === 0) return false;
    if (arguments.length < 2) return true;
    switch (value) {
      case vs[0]:
      case vs[vs.length - 1]:
        return true;
      default:
        return indexOf(vs, value) > -1;
    }
  }
  public delete(key: K, value?: V): boolean {
    if (arguments.length < 2) return this.memory.delete(key);
    const vs = this.memory.get(key);
    if (!vs || vs.length === 0) return false;
    switch (value) {
      case vs[0]:
        vs.shift();
        break;
      case vs[vs.length - 1]:
        vs.pop();
        break;
      default:
        const i = indexOf(vs, value);
        if (i === -1) return false;
        splice(vs, i, 1);
    }
    vs.length === 0 && this.memory.delete(key);
    return true;
  }
  public clear(): void {
    this.memory.clear();
  }
  public take(key: K): V | undefined;
  public take(key: K, count: number): V[];
  public take(key: K, count?: number): V | undefined | V[] {
    const vs = this.memory.get(key) ?? [];
    return count === void 0
      ? splice(vs, 0, 1)[0]
      : splice(vs, 0, count);
  }
  public ref(key: K): V[] {
    let vs = this.memory.get(key);
    if (vs) return vs;
    vs = [];
    this.memory.set(key, vs);
    return vs;
  }
  public *[Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    for (const [k, vs] of this.memory) {
      for (let i = 0; i < vs.length; ++i) {
        yield [k, vs[i]];
      }
    }
    return;
  }
}
