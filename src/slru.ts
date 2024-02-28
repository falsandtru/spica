import { List } from './clist';

class Entry<K, V> implements List.Node {
  constructor(
    public key: K,
    public value: V,
  ) {
  }
  public partition: 1 | 2 = 1;
  public next?: this = undefined;
  public prev?: this = undefined;
}

export class SLRU<K, V> {
  constructor(
    private readonly capacity: number,
    private readonly partition = 80,
  ) {
  }
  private readonly dict = new Map<K, Entry<K, V>>();
  private readonly T1 = new List<Entry<K, V>>();
  private readonly T2 = new List<Entry<K, V>>();
  private add_T1(entry: Entry<K, V>): void {
    assert(!entry.next);
    if (this.length === this.capacity) {
      assert(entry.partition === 1);
      this.dict.delete(this.del_T1_LRU().key);
    }
    entry.partition = 1;
    this.T1.unshift(entry);
  }
  private add_T2(entry: Entry<K, V>): void {
    assert(!entry.next);
    if (entry.partition === 1 &&
        this.T2.length >= this.capacity * this.partition / 100 >>> 0) {
      this.add_T1(this.del_T2_LRU());
    }
    entry.partition = 2;
    this.T2.unshift(entry);
    assert(this.T2.length <= this.capacity * this.partition / 100 >>> 0);
  }
  private del_T1(entry: Entry<K, V>): void {
    assert(entry.next);
    this.T1.delete(entry);
  }
  private del_T2(entry: Entry<K, V>): void {
    assert(entry.next);
    this.T2.delete(entry);
  }
  private del_T1_LRU(): Entry<K, V> {
    assert(this.T1.length);
    return this.T1.pop()!;
  }
  private del_T2_LRU(): Entry<K, V> {
    assert(this.T2.length);
    return this.T2.pop()!;
  }
  public get length(): number {
    return this.T1.length + this.T2.length;
  }
  public set(key: K, value: V): this {
    const entry = this.dict.get(key);
    switch (entry?.partition) {
      case 1:
      case 2:
        entry.value = value;
        break;
      default:
        this.add_T1(new Entry(key, value));
        this.dict.set(key, this.T1.head!);
        assert(this.length <= this.capacity);
        assert(this.length === this.dict.size);
        break;
    }
    return this;
  }
  public get(key: K): V | undefined {
    const entry = this.dict.get(key);
    switch (entry?.partition) {
      case 1:
        this.del_T1(entry);
        this.add_T2(entry);
        assert(this.length <= this.capacity);
        assert(this.length === this.dict.size);
        return entry.value;
      case 2:
        this.del_T2(entry);
        this.add_T2(entry);
        assert(this.length <= this.capacity);
        assert(this.length === this.dict.size);
        return entry.value;
      default:
        return;
    }
  }
  public has(key: K): boolean {
    return this.dict.has(key);
  }
  public clear() {
    this.dict.clear();
    this.T1.clear();
    this.T2.clear();
  }
}
