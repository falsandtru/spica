import { WeakMapLike } from '../../../index.d';
import { sqid } from '../sqid';
import { type } from '../type';

export class DataMap<K, V> implements WeakMapLike<K, V> {
  constructor(entries: Iterable<[K, V]> = []) {
    void [...entries]
      .forEach(([k, v]) =>
        void this.set(k, v));
  }
  private readonly store = new Map<string, [K, V]>();
  public get(key: K): V | undefined {
    return (this.store.get(stringify(key)) || [] as any as [never, V])[1];
  }
  public set(key: K, val: V): this {
    void this.store.set(stringify(key), [key, val]);
    return this;
  }
  public has(key: K): boolean {
    return this.store.has(stringify(key));
  }
  public delete(key: K): boolean {
    return this.store.delete(stringify(key));
  }
  public clear(): void {
    return this.store.clear();
  }
  public get size(): number {
    return this.store.size;
  }
}

const oids = new WeakMap<object, string>();

function stringify(target: any): string {
  switch (type(target)) {
    case 'undefined':
    case 'null':
      return `0:${target}`;
    case 'boolean':
      return `1:${target}`;
    case 'number':
      return `2:${target}`;
    case 'string':
      return `3:${encodeURIComponent(target)}`;
    case 'symbol':
      return `4:${encodeURIComponent(target.toString().replace(/^Symbol\((.*?)\)$/, '$1'))}`;
    case 'Array':
      return `9:${stringifyArray(target)}`;
    default:
      return `9:${
        stringifyObject(target) ||
        oids.get(target) || oids.set(target, sqid()).get(target)!
      }`;
  }
}

function stringifyArray(arr: any[]): string {
  assert(Array.isArray(arr));
  let acc = '';
  for (const k of arr) {
    acc += `${stringify(k)},`;
  }
  return `[${acc}]`;
}

function stringifyObject(obj: object): string {
  assert(obj instanceof Object);
  let acc = '';
  for (const k of Object.keys(obj)) {
    acc += `${stringify(k)}:${stringify(obj[k])},`;
  }
  return `{${acc}}`;
}
