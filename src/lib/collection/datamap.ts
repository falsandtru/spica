import {sqid} from '../sqid';
import {type} from '../type';

function isPrimitive(target: any): boolean {
  return target instanceof Object === false;
}

export class DataMap<K, V> {
  private readonly store = new Map<string, [K, V]>();
  private readonly weakstore = new WeakMap<K, string>();
  private stringify(key: any): string {
    switch (typeof key) {
      case 'undefined':
        return `0:${key}`;
      case 'boolean':
        return `1:${key}`;
      case 'number':
        return `2:${1e3 + ('' + key).length}:${key}`;
      case 'string':
        return `3:${1e14 + key.length}:${key}`;
      default: {
        if (isPrimitive(key)) {
          return `8:${key}`;
        }
        if (Array.isArray(key)) {
          return `9:[ ${this.stringifyArray(<any[]>key)} ]`;
        }
        return `9:{ ${
          this.stringifyObject(key) ||
          this.weakstore.get(key)! ||
          this.weakstore.set(key, sqid()).get(key)!
        } }`;
      }
    }
  }
  private stringifyArray(key: any[]): string {
    let acc = '';
    for (const k of key) {
      acc += `${this.stringify(k)}`;
    }
    return acc;
  }
  private stringifyObject(key: any[]): string {
    if (type(key) !== 'Object') return '';
    const keys = Object.keys(key);
    let acc = '';
    for (const k of keys) {
      acc += `${this.stringify(k)}: ${this.stringify(key[k])}`;
    }
    return acc || ' ';
  }
  public get(key: K): V | undefined {
    return (this.store.get(this.stringify(key)) || <[void, V]><any>[])[1];
  }
  public set(key: K, val: V): this {
    return (void this.store.set(this.stringify(key), [key, val]), this);
  }
  public has(key: K): boolean {
    return this.store.has(this.stringify(key));
  }
  public delete(key: K): boolean {
    return this.store.delete(this.stringify(key));
  }
  public clear(): void {
    return this.store.clear();
  }
  public get size(): number {
    return this.store.size;
  }
}
