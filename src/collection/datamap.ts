import { encodeURIComponent } from '../global';
import { IterableCollection } from '../collection';
import { type } from '../type';
import { memoize } from '../memoize';
import { sqid } from '../sqid';

export class DataMap<K, V> implements IterableCollection<K, V> {
  constructor(
    entries: Iterable<[K, V]> = [],
    private indentify: (key: K) => unknown = stringify,
  ) {
    for (const [k, v] of entries) {
      this.set(k, v);
    }
  }
  private readonly store = new Map<unknown, [K, V]>();
  public get(key: K): V | undefined {
    return this.store.get(this.indentify(key))?.[1];
  }
  public set(key: K, val: V): this {
    this.store.set(this.indentify(key), [key, val]);
    return this;
  }
  public has(key: K): boolean {
    return this.store.has(this.indentify(key));
  }
  public delete(key: K): boolean {
    return this.store.delete(this.indentify(key));
  }
  public clear(): void {
    return this.store.clear();
  }
  public get size(): number {
    return this.store.size;
  }
  public [Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    return this.store.values();
  }
}

function stringify(target: any): string {
  switch (type(target)) {
    case 'undefined':
    case 'null':
      return `0:${target}`;
    case 'boolean':
      return `1:${target}`;
    case 'number':
      return `2:${target}`;
    case 'bigint':
      return `3:${target}n`;
    case 'string':
      return `4:${encodeURIComponent(target)}`;
    case 'symbol':
      return `5:${encodeURIComponent(target.toString())}`;
    case 'Function':
      return `8:${target}`;
    case 'Array':
      return `9:${stringifyArray(target)}`;
    case 'Object':
      return `9:${stringifyObject(target)}`;
    default:
      return `9:${type(target)}-${identify(target)}`;
  }
}

function stringifyArray(arr: unknown[]): string {
  assert(Array.isArray(arr));
  let acc = '';
  for (const k of arr) {
    acc += `${stringify(k)},`;
  }
  return `[${acc}]`;
}

function stringifyObject(obj: object): string {
  let acc = '';
  for (const k in obj) {
    acc += `${stringify(k)}:${stringify(obj[k])},`;
  }
  return `{${acc}}`;
}

const identify = memoize(_ => sqid(), new WeakMap());
