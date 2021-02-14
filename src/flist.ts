// Indexed circular linked list

export class FList<K, V = undefined> {
  constructor(
    private readonly capacity: number,
    private readonly interval: number = capacity,
  ) {
    assert(capacity > 0);
    this.interval = interval < 1
      ? this.capacity * this.interval | 0
      : this.interval;
  }
  private items: (Item<K, V> | undefined)[] = [];
  private indexes: number[] = [];
  private head = 0;
  private cursor = 0;
  public length = 0;
  public add(this: FList<K, undefined>, key: K, value?: V): boolean;
  public add(key: K, value: V): boolean;
  public add(key: K, value: V): boolean {
    const items = this.items;
    const head = items[this.head];
    assert(this.length === 0 ? !head : head);
    if (!head) {
      assert(this.length === 0);
      const index = this.head = this.cursor = this.indexes.length > 0
        ? this.indexes.shift()!
        : this.length;
      assert(!items[index]);
      this.length++;
      items[index] =
        new Item(index, key, value, head!, head!);
      assert(this.items[index] === this.items[index]!.prev && this.items[index]!.prev === this.items[index]!.next);
      //assert(this.length > 10 || [...this].length === this.length);
      return false;
    }
    assert(head);
    if (this.length < this.capacity) {
      const index = this.head = this.cursor = this.indexes.length > 0
        ? this.indexes.shift()!
        : this.length;
      assert(!items[index]);
      this.length++;
      items[index] = head.prev = head.prev.next =
        new Item(index, key, value, head, head.prev);
      assert(this.length !== 1 || this.items[index] === this.items[index]!.prev && this.items[index]!.prev === this.items[index]!.next);
      assert(this.length !== 2 || this.items[index] !== this.items[index]!.prev && this.items[index]!.prev === this.items[index]!.next);
      assert(this.length < 3 || this.items[index] !== this.items[index]!.prev && this.items[index]!.prev !== this.items[index]!.next);
      //assert(this.length > 10 || [...this].length === this.length);
      return false;
    }
    else {
      assert(this.length === this.capacity);
      assert(this.indexes.length === 0);
      const index = this.head = this.cursor = items[this.head]!.prev.index;
      assert(items[index]);
      const garbage = items[index]!;
      items[index] = head.prev = head.prev.prev.next =
        new Item(index, key, value, head, head.prev.prev);
      assert(this.length !== 1 || this.items[index] === this.items[index]!.prev && this.items[index]!.prev === this.items[index]!.next);
      assert(this.length !== 2 || this.items[index] !== this.items[index]!.prev && this.items[index]!.prev === this.items[index]!.next);
      assert(this.length < 3 || this.items[index] !== this.items[index]!.prev && this.items[index]!.prev !== this.items[index]!.next);
      // @ts-expect-error
      garbage.prev = garbage.next = void 0;
      assert(this.head === index);
      //assert(this.length > 10 || [...this].length === this.length);
      return false;
    }
  }
  public put(this: FList<K, undefined>, key: K, value?: V, index?: number): boolean;
  public put(key: K, value: V, index?: number): boolean;
  public put(key: K, value: V, index?: number): boolean {
    const item = this.seek(key, index);
    if (!item) return this.add(key, value);
    assert(this.cursor === item.index);
    this.head = item.index;
    item.value = value;
    return true;
  }
  public shift(): { index: number; key: K; value: V; } | undefined {
    assert(this.length === 0 ? !this.items[this.head] : this.items[this.head]);
    const item = this.items[this.head];
    assert(this.length === 0 ? !item : item);
    if (!item) return;
    this.delete(item.key, item.index);
    return {
      index: item.index,
      key: item.key,
      value: item.value,
    };
  }
  public pop(): { index: number; key: K; value: V; } | undefined {
    assert(this.length === 0 ? !this.items[this.head]?.prev : this.items[this.head]?.prev);
    const item = this.items[this.head]?.prev;
    assert(this.length === 0 ? !item : item);
    if (!item) return;
    this.delete(item.key, item.index);
    return {
      index: item.index,
      key: item.key,
      value: item.value,
    };
  }
  public delete(key: K, index?: number): V | undefined {
    const cursor = this.cursor;
    const item = this.seek(key, index, false);
    if (!item) return;
    this.cursor = cursor;
    assert(this.length > 0);
    assert(this.length !== 1 || item === item.prev && item.prev === item.next);
    assert(this.length !== 2 || item !== item.prev && item.prev === item.next);
    assert(this.length < 3 || item !== item.prev && item.prev !== item.next);
    --this.length;
    this.indexes.push(item.index);
    const { prev, next } = item;
    prev.next = next;
    next.prev = prev;
    // @ts-expect-error
    this.items[item.index] = item.prev = item.next = void 0;
    if (this.head === item.index) {
      this.head = next.index;
    }
    if (this.cursor === item.index) {
      this.cursor = next.index;
    }
    assert(this.length === 0 ? !this.items[this.cursor] : this.items[this.cursor]);
    //assert(this.length > 10 || [...this].length === this.length);
    return item.value;
  }
  public peek(): { index: number; key: K; value: V; } | undefined {
    const item = this.items[this.head];
    return item && {
      index: item.index,
      key: item.key,
      value: item.value,
    };
  }
  public item(index: number | undefined): { index: number; key: K; value: V; } | undefined {
    const item = index !== void 0
      ? this.items[index]
      : void 0;
    return item && {
      index: this.cursor = item.index,
      key: item.key,
      value: item.value,
    };
  }
  public find(key: K, index?: number): V | undefined {
    return this.seek(key, index)?.value;
  }
  public findIndex(key: K, index?: number): number | undefined {
    return this.seek(key, index)?.index;
  }
  public has(key: K, index?: number): boolean {
    return !!this.seek(key, index, false);
  }
  public *[Symbol.iterator](): Iterator<[K, V, number], undefined, undefined> {
    for (let item = this.items[this.head], i = 0; item && i < this.length; (item = item.next) && ++i) {
      yield [item.key, item.value, item.index];
    }
    return;
  }
  private seek(key: K, cursor: number = this.cursor, aging = true): Item<K, V> | undefined {
    let item = this.items[cursor];
    if (!item) return;
    assert(this.items[this.head]);
    const newest = this.items[this.head]!;
    const isNaN = key !== key;
    if (isNaN ? item.key !== item.key : item.key === key) return this.cursor = cursor, item;
    aging && age(item, false);
    let newer = item;
    const interval = this.interval < this.length
      ? this.interval
      : this.length;
    for (let i = 1; (item = item.next) && i < interval; ++i) {
      if (isNaN ? item.key !== item.key : item.key === key) {
        aging && age(item);
        newer = item.age > newer.age ? item : newer;
        this.head = newer.age > newest.age ? newer.index : newest.index;
        return this.cursor = item.index, item;
      }
      else {
        aging && age(item, false);
        newer = item.age > newer.age ? item : newer;
      }
    }
    this.head = newer.age > newest.age ? newer.index : newest.index;
    this.cursor = item.index;
  }
}

class Item<K, V> {
  constructor(
    public readonly index: number,
    public readonly key: K,
    public value: V,
    public next: Item<K, V>,
    public prev: Item<K, V>,
  ) {
    this.next ??= this;
    if (next?.index === index) {
      this.next = next.next === next
        ? this
        : next.next;
    }
    this.prev ??= this;
    if (prev?.index === index) {
      this.prev = prev.prev === prev
        ? this
        : prev.prev;
    }
  }
  public age = 0 >>> 0;
}

function age<K, V>(item: Item<K, V>, hit?: boolean): Item<K, V>;
function age<K, V>(item: Item<K, V> | undefined, hit?: boolean): Item<K, V> | undefined;
function age<K, V>(item: Item<K, V> | undefined, hit = true): Item<K, V> | undefined {
  if (!item) return;
  item.age >>>= 1;
  item.age |= +hit && 0x80000000;
  item.age >>>= 0;
  assert(item.age === item.age >>> 0);
  return item;
}
