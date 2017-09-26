import { WeakMapLike } from '../../../index.d';
import { sqid } from '../sqid';
import { type } from '../type';

function isPrimitive(target: any): boolean {
  return target instanceof Object === false;
}

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

function stringify(key: any): string {
  switch (typeof key) {
    case 'undefined':
      return `0:${key}`;
    case 'boolean':
      return `1:${key}`;
    case 'number':
      return `2:${key}`;
    case 'string':
      return `3:${encodeURIComponent(key)}`;
    case 'symbol':
      return `4:${encodeURIComponent(key.toString().replace(/^Symbol\((.*?)\)$/, '$1'))}`;
    default:
      return isPrimitive(key)
        ? `8:${encodeURIComponent(key)}`
        : `9:${
            stringifyArray(key) ||
            stringifyObject(key) ||
            oids.get(key) || oids.set(key, sqid()).get(key)!
          }`;
  }
}

function stringifyArray(key: any[]): string {
  if (!Array.isArray(key)) return '';
  let acc = '';
  for (const k of key) {
    acc += `${stringify(k)},`;
  }
  return `[${acc}]`;
}

function stringifyObject(key: object): string {
  if (type(key) !== 'Object') return '';
  let acc = '';
  for (const k of Object.keys(key)) {
    acc += `(${stringify(k)}:${stringify(key[k])}),`;
  }
  return `{${acc}}`;
}
