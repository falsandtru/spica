import { IterableDict } from '../dict';
import { Ring } from '../ring';

export class MultiMap<K, V> implements IterableDict<K, V> {
  constructor(
    entries?: Iterable<readonly [K, V]>,
  ) {
    if (entries) for (const { 0: k, 1: v } of entries) {
      this.set(k, v);
    }
  }
  private memory = new Map<K, Ring<V>>();
  public get size(): number {
    return this.memory.size;
  }
  public get(key: K): V | undefined {
    return this.memory.get(key)?.at(0);
  }
  public getAll(key: K): Ring<V> | undefined {
    return this.memory.get(key);
  }
  public set(key: K, value: V): this {
    let vs = this.memory.get(key);
    if (vs) return vs.push(value), this;
    vs = new Ring();
    vs.push(value);
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
    this.memory = new Map();
  }
  public take(key: K): V | undefined;
  public take(key: K, count: number): V[];
  public take(key: K, count?: number): V | undefined | V[] {
    const vs = this.memory.get(key);
    if (count === undefined) return vs?.shift();
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
