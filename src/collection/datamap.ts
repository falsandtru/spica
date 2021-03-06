import { Map } from '../global';
import { IterableCollection } from '../collection';
import { type } from '../type';
import { memoize } from '../memoize';

export class DataMap<K, V> implements IterableCollection<K, V> {
  constructor(
    entries: Iterable<[K, V]> = [],
    private indentify: (key: K) => unknown = stringify,
  ) {
    for (const [k, v] of entries) {
      this.set(k, v);
    }
  }
  private readonly memory = new Map<unknown, [K, V]>();
  public get(key: K): V | undefined {
    return this.memory.get(this.indentify(key))?.[1];
  }
  public set(key: K, val: V): this {
    this.memory.set(this.indentify(key), [key, val]);
    return this;
  }
  public has(key: K): boolean {
    return this.memory.has(this.indentify(key));
  }
  public delete(key: K): boolean {
    return this.memory.delete(this.indentify(key));
  }
  public clear(): void {
    return this.memory.clear();
  }
  public get size(): number {
    return this.memory.size;
  }
  public [Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    return this.memory.values();
  }
}

function stringify(target: any): string {
  const t = type(target);
  switch (t) {
    case 'undefined':
    case 'null':
      return `0:${target}`;
    case 'boolean':
      return `0:${target}`;
    case 'number':
      return `0:${target}`;
    case 'bigint':
      return `0:${target}n`;
    case 'string':
      return `1:${escape(target)}`;
    case 'symbol':
      return `2:${escape(target.toString())}`;
    case 'Function':
      return `7:${escape(target)}`;
    case 'Array':
      return `8:${stringifyArray(target)}`;
    case 'Object':
      return `8:${stringifyObject(target)}`;
    default:
      return `9:${escape(t)}(${identify(target)})`;
  }
}

function escape(str: string): string {
  return str.indexOf('\n') > -1
    ? str.replace(/\n/g, '%0A')
    : str;
}

function stringifyArray(arr: unknown[]): string {
  assert(Array.isArray(arr));
  let acc = '';
  for (const k of arr) {
    acc += `${stringify(k)},\n`;
  }
  return `[\n${acc}]`;
}

function stringifyObject(obj: object): string {
  let acc = '';
  for (const k in obj) {
    acc += `${stringify(k)}: ${stringify(obj[k])},\n`;
  }
  return `{\n${acc}}`;
}

const identify = (counter => memoize<object, number>(() => ++counter, new WeakMap()))(0);
