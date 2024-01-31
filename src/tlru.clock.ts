import { max } from './alias';
import { IterableDict } from './dict';
import { List } from './list';

class Entry<K, V> implements List.Node {
  constructor(
    public key: K,
    public value: V,
  ) {
  }
  public next?: this = undefined;
  public prev?: this = undefined;
}

export class TLRU<K, V> implements IterableDict<K, V> {
  constructor(
    private readonly capacity: number,
    private readonly step: number = 1,
    private readonly window: number = 0,
    private readonly retrial: boolean = true,
  ) {
  }
  private readonly dict = new Map<K, Entry<K, V>>();
  private readonly list = new List<Entry<K, V>>();
  private handV?: Entry<K, V> = undefined;
  private handG?: Entry<K, V> = undefined;
  private count = 0;
  public get length(): number {
    return this.list.length;
  }
  public get size(): number {
    return this.list.length;
  }
  private return(): void {
    const { list } = this;
    if (this.count !== -1 &&
        this.handV !== undefined &&
        this.handG !== list.last && this.handG !== undefined) {
      if (this.count >= 0) {
        // 1周できる
        assert(this.count <= this.capacity);
        //this.count = -max(max(list.length - this.count, 0) * this.step / 100 | 0, 1) - 1;
        this.count = -max(
          list.length * this.step / 100 | 0,
          list.length * this.window / 100 - this.count | 0,
          1) - 1;
        assert(this.count < 0);
      }
      else {
        this.handG = this.handG.prev;
      }
    }
    else {
      if (this.handV === list.head) {
        this.handG = undefined;
      }
      if (this.handG === list.last!) {
        this.handG = this.handG.prev;
      }
      this.handV = list.last;
      this.count = 0;
    }
  }
  private replace(key: K, value: V): void {
    const { dict, list } = this;
    if (this.handV === this.handG || this.handV === list.last) {
      this.return();
    }
    // 非延命
    if (this.count >= 0 || !this.retrial) {
      const entry = this.handV ??= list.last!;
      dict.delete(entry.key);
      dict.set(key, entry);
      entry.key = key;
      entry.value = value;
    }
    // 延命
    else {
      assert(this.count < 0);
      const entry = list.last!;
      dict.delete(entry.key);
      dict.set(key, entry);
      entry.key = key;
      entry.value = value;
      this.escape(entry);
      list.delete(entry);
      assert(this.handG !== undefined);
      if (this.handG !== list.head) {
        list.insert(entry, this.handG);
      }
      else {
        list.unshift(entry);
      }
      this.handV = entry;
      this.handG = entry.prev;
    }
    if(this.handV !== this.handG){
      this.handV = this.handV.prev;
    }
    assert(this.count >= 0 || this.handV === this.handG);
    ++this.count;
  }
  public evict(): [K, V] | undefined {
    const { list } = this;
    if (list.length === 0) return;
    const entry = this.handV ??= list.last!;
    this.delete(entry.key);
    return [entry.key, entry.value];
  }
  public add(key: K, value: V): boolean {
    const { dict, list } = this;
    if (list.length === this.capacity) {
      this.replace(key, value);
    }
    else {
      const entry = new Entry(key, value);
      dict.set(key, entry);
      if (this.handV !== undefined) {
        list.insert(entry, this.handV.next);
      }
      else {
        list.unshift(entry);
      }
    }
    assert(dict.size <= this.capacity);
    assert(list.length <= this.capacity);
    return true;
  }
  public set(key: K, value: V): this {
    const entry = this.dict.get(key);
    if (entry === undefined) {
      this.add(key, value);
    }
    else {
      entry.value = value;
    }
    assert(this.dict.size <= this.capacity);
    assert(this.list.length <= this.capacity);
    return this;
  }
  private escape(entry: Entry<K, V>): void {
    const { list } = this;
    if (list.length <= 1) {
      this.handV = undefined;
      this.handG = undefined;
      this.count = 0;
      return;
    }
    if (entry === this.handV) {
      this.handV = this.handV !== list.head
        ? this.handV.prev
        : this.handV.next;
    }
    if (entry === this.handG) {
      this.handG = this.handG !== list.head
        ? this.handG.prev
        : this.handG.next;
    }
  }
  public get(key: K): V | undefined {
    const { dict, list } = this;
    const entry = dict.get(key);
    if (entry === undefined) return;
    if (entry !== list.head) {
      this.escape(entry);
      list.delete(entry);
      list.unshift(entry);
    }
    this.handG ??= entry;
    return entry.value;
  }
  public has(key: K): boolean {
    return this.dict.has(key);
  }
  public delete(key: K): boolean {
    const { dict, list } = this;
    const entry = dict.get(key);
    if (entry === undefined) return false;
    this.escape(entry);
    list.delete(entry);
    assert(entry !== this.handV);
    assert(entry !== this.handG);
    return dict.delete(key);
  }
  public clear(): void {
    this.dict.clear();
    this.list.clear();
    this.handV = undefined;
    this.handG = undefined;
    this.count = 0;
  }
  public *[Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    for (const { key, value } of this.list) {
      yield [key, value];
    }
  }
}
