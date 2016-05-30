import {WeakMap} from './weakmap';
import {isPrimitive} from './map';
import {sqid} from '../sqid';
import {type} from '../type';

export class DataMap<K, V> {
  constructor() {
    void this.reset_();
  }
  private store: { [index: string]: [K, V]; } = Object.create(null);
  private weakstore = new WeakMap<K, string>();
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
        if (key instanceof Array) {
          return `9:[ ${this.stringifyArray(<any[]>key)} ]`;
        }
        return `9:{ ${
          this.weakstore.has(key)
            ? this.weakstore.get(key)
            : this.stringifyObject(key) || this.weakstore.set(key, sqid())
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
  public get(key: K): V {
    return (this.store[this.stringify(key)] || <[void, V]>[])[1];
  }
  public set(key: K, val: V): V {
    void this.reset_();
    return (this.store[this.stringify(key)] = [key, val])[1];
  }
  public has(key: K): boolean {
    return !!this.store[this.stringify(key)];
  }
  public delete(key: K): void {
    void this.reset_();
    return void delete this.store[this.stringify(key)];
  }
  public clear(): void {
    void this.reset_();
    this.store = Object.create(null);
  }
  private reset_(): void {
    this.size_ = NaN;
    this.entries_ = void 0;
  }
  private size_: number;
  public get size(): number {
    return this.size_ >= 0
      ? this.size_
      : this.size_ = Object.keys(this.store).length;
  }
  private entries_: [K, V][];
  public entries(): [K, V][] {
    return this.entries_
      ? this.entries_
      : this.entries_ = Object.keys(this.store)
        .sort()
        .map(key => this.store[key]);
  }
}
