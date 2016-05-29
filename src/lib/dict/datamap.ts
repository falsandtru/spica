import {v4 as uuid} from '../uuid';

const UNIQUE_SEPARATOR = `\uDFFF${uuid().slice(-4)}\uDBFF`;
function serialize<K>(key: K[]): string {
  let acc = '';
  for (const k of key) {
    acc += k + UNIQUE_SEPARATOR;
  }
  return acc;
}

export class DataMap<K extends Array<string | number>, V> {
  constructor() {
    void this.reset_();
  }
  private store: { [index: string]: [K, V] } = Object.create(null);
  public get(key: K): V {
    return (this.store[serialize(key)] || <[void, V]>[])[1];
  }
  public set(key: K, val: V): V {
    void this.reset_();
    return (this.store[serialize(key)] = [key, val])[1];
  }
  public has(key: K): boolean {
    return !!this.store[serialize(key)];
  }
  public delete(key: K): void {
    void this.reset_();
    return void delete this.store[serialize(key)];
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
      : this.entries_ = Object.keys(this.store).map(key => this.store[key]);
  }
}
