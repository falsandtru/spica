import { equal } from '../compare';

// Indexed circular linked list

export class IList<K, V = undefined> {
  constructor(
    private readonly capacity: number,
  ) {
    assert(capacity > 0);
  }
  private items: (Item<K, V> | undefined)[] = [];
  private empties: number[] = [];
  private head = 0;
  private cursor = 0;
  public length = 0;
  public clear(): void {
    this.items = [];
    this.empties = [];
    this.head = 0;
    this.cursor = 0;
    this.length = 0;
  }
  public add(this: IList<K, undefined>, key: K, value?: V): boolean;
  public add(key: K, value: V): boolean;
  public add(key: K, value: V): boolean {
    const items = this.items;
    const head = items[this.head];
    assert(this.length === 0 ? !head : head);
    if (!head) {
      assert(this.length === 0);
      const index = this.head = this.cursor = this.empties.length > 0
        ? this.empties.shift()!
        : this.length;
      assert(!items[index]);
      ++this.length;
      items[index] =
        new Item(index, key, value, head!, head!);
      assert(this.items[index] === this.items[index]!.prev && this.items[index]!.prev === this.items[index]!.next);
      assert(this.length > 10 || [...this].length === this.length);
      return false;
    }
    assert(head);
    if (this.length < this.capacity) {
      const index = this.head = this.cursor = this.empties.length > 0
        ? this.empties.shift()!
        : this.length;
      assert(!items[index]);
      ++this.length;
      items[index] = head.prev = head.prev.next =
        new Item(index, key, value, head, head.prev);
      assert(this.length !== 1 || this.items[index] === this.items[index]!.prev && this.items[index]!.prev === this.items[index]!.next);
      assert(this.length !== 2 || this.items[index] !== this.items[index]!.prev && this.items[index]!.prev === this.items[index]!.next);
      assert(this.length < 3 || this.items[index] !== this.items[index]!.prev && this.items[index]!.prev !== this.items[index]!.next);
      assert(this.length > 10 || [...this].length === this.length);
      return false;
    }
    else {
      assert(this.length === this.capacity);
      assert(this.empties.length === 0);
      const index = this.head = this.cursor = head.prev.index;
      assert(items[index]);
      const garbage = items[index]!;
      items[index] = head.prev = head.prev.prev.next =
        new Item(index, key, value, head, head.prev.prev);
      assert(this.length !== 1 || this.items[index] === this.items[index]!.prev && this.items[index]!.prev === this.items[index]!.next);
      assert(this.length !== 2 || this.items[index] !== this.items[index]!.prev && this.items[index]!.prev === this.items[index]!.next);
      assert(this.length < 3 || this.items[index] !== this.items[index]!.prev && this.items[index]!.prev !== this.items[index]!.next);
      // @ts-expect-error
      garbage.prev = garbage.next = void 0;
      assert(this.length > 10 || [...this].length === this.length);
      return false;
    }
  }
  public put(this: IList<K, undefined>, key: K, value?: V, index?: number): boolean;
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
    assert(this.length === 0 ? !this.items[this.head] : this.items[this.head]);
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
    const item = this.seek(key, index);
    if (!item) return;
    this.cursor = cursor;
    assert(this.length > 0);
    assert(this.length !== 1 || item === item.prev && item.prev === item.next);
    assert(this.length !== 2 || item !== item.prev && item.prev === item.next);
    assert(this.length < 3 || item !== item.prev && item.prev !== item.next);
    --this.length;
    this.empties.push(item.index);
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
    assert(this.length === 0 ? !this.items[this.head] : this.items[this.head]);
    assert(this.length === 0 ? !this.items[this.cursor] : this.items[this.cursor]);
    assert(this.length > 10 || [...this].length === this.length);
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
    return !!this.seek(key, index);
  }
  public *[Symbol.iterator](): Iterator<[K, V, number], undefined, undefined> {
    for (let item = this.items[this.head], i = 0; item && i < this.length; (item = item.next) && ++i) {
      yield [item.key, item.value, item.index];
    }
    return;
  }
  private seek(key: K, cursor = this.cursor): Item<K, V> | undefined {
    let item: Item<K, V> | undefined;
    item = this.items[cursor = cursor < 0 ? this.head : cursor];
    if (!item) return;
    if (equal(item.key, key)) return this.cursor = cursor, item;
    for (let i = 1; i < this.length && (item = item.next); ++i) {
      if (equal(item.key, key)) return this.cursor = item.index, item;
    }
  }
  private insert(item: Item<K, V>, before: number): void {
    if (item.index === before) return;
    const a1 = this.items[before];
    if (!a1) return;
    const b1 = item;
    if (a1 === b1) return;
    if (b1.next === a1) return;
    const a0 = a1.prev;
    const b0 = b1.prev;
    const b2 = b1.next;
    a0.next = b1;
    b1.next = a1;
    a1.prev = b1;
    b1.prev = a0;
    b0.next = b2;
    b2.prev = b0;
    assert(a0.next === b1);
    assert(b1.next === a1);
    assert(a1.prev === b1);
    assert(b1.prev === a0);
    assert(b0.next === b2);
    assert(b2.prev === b0);
    assert(this.length > 10 || [...this].length === this.length);
  }
  public raiseToTop(index: number): boolean {
    if (this.length <= 1) return false;
    if (index === this.head) return false;
    const item = this.items[index];
    if (!item) return false;
    this.insert(item, this.head);
    this.head = index;
    return true;
  }
  public raiseToPrev(index: number): boolean {
    if (this.length <= 1) return false;
    const item = this.items[index];
    if (!item) return false;
    this.insert(item, item.prev.index);
    if (item.next.index === this.head) {
      this.head = item.index;
    }
    return true;
  }
  public swap(index1: number, index2: number): boolean {
    if (this.length <= 1) return false;
    if (index1 === index2) return false;
    const item1 = this.items[index1];
    const item2 = this.items[index2];
    if (!item1 || !item2) return false;
    if (item1.next === item2) return this.raiseToPrev(index2)
    if (item2.next === item1) return this.raiseToPrev(index1)
    const item3 = item2.next;
    this.insert(item2, item1.index);
    this.insert(item1, item3.index);
    switch (this.head) {
      case item1.index:
        this.head = item2.index;
        break;
      case item2.index:
        this.head = item1.index;
        break;
    }
    return true;
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
    if (!next || next.index === index) {
      assert(!next || next.next === next);
      this.next = this;
    }
    if (!prev || prev.index === index) {
      assert(!prev || prev.prev === prev);
      this.prev = this;
    }
  }
}
