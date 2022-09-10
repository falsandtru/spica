import { Map } from '../global';
import { IterableDict } from '../dict';
import { Ring } from '../ring';

interface Dict<K, V> extends IterableDict<K, V> {
  clear(): void;
}

export class MultiMap<K, V> implements IterableDict<K, V> {
  constructor(
    entries: Iterable<[K, V]> = [],
    private readonly memory: Dict<K, Ring<V>> = new Map(),
  ) {
    for (const { 0: k, 1: v } of entries) {
      this.set(k, v);
    }
  }
  public get(key: K): V | undefined {
    return this.memory.get(key)?.at(0);
  }
  public getAll(key: K): Ring<V> | undefined {
    return this.memory.get(key);
  }
  public set(key: K, val: V): this {
    let vs = this.memory.get(key);
    if (vs) return vs.push(val), this;
    vs = new Ring();
    vs.push(val);
    this.memory.set(key, vs);
    return this;
  }
  public has(key: K, value?: V): boolean {
    const vs = this.memory.get(key);
    if (!vs?.length) return false;
    if (arguments.length < 2) return true;
    return vs.includes(value!);
  }
  public delete(key: K, value?: V): boolean {
    if (arguments.length < 2) return this.memory.delete(key);
    const vs = this.memory.get(key);
    if (!vs?.length) return false;
    const i = vs.indexOf(value!);
    if (i === -1) return false;
    vs.splice(i, 1);
    return true;
  }
  public clear(): void {
    this.memory.clear();
  }
  public take(key: K): V | undefined;
  public take(key: K, count: number): V[];
  public take(key: K, count?: number): V | undefined | V[] {
    const vs = this.memory.get(key);
    if (count === void 0) return vs?.shift();
    const acc: V[] = [];
    while (vs?.length && count--) {
      acc.push(vs.shift()!);
    }
    return acc;
  }
  public ref(key: K): Ring<V> {
    let vs = this.memory.get(key);
    if (vs) return vs;
    vs = new Ring();
    this.memory.set(key, vs);
    return vs;
  }
  public *[Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    for (const { 0: k, 1: vs } of this.memory) {
      for (let i = 0; i < vs.length; ++i) {
        yield [k, vs.at(i)!];
      }
    }
    return;
  }
}
