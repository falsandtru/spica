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
  private nodes: (Item<K, V> | undefined)[] = [];
  private indexes: number[] = [];
  private head = 0;
  private cursor = 0;
  public length = 0;
  public add(this: FList<K, undefined>, key: K, value?: V): boolean;
  public add(key: K, value: V): boolean;
  public add(key: K, value: V): boolean {
    const nodes = this.nodes;
    const head = nodes[this.head];
    assert(this.length === 0 ? !head : head);
    if (!head) {
      assert(this.length === 0);
      const index = this.head = this.cursor = this.indexes.length > 0
        ? this.indexes.shift()!
        : this.length;
      assert(!nodes[index]);
      this.length++;
      nodes[index] =
        new Item(index, key, value, head!, head!);
      assert(this.nodes[index] === this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      //assert(this.length > 10 || [...this].length === this.length);
      return false;
    }
    assert(head);
    if (this.length < this.capacity) {
      const index = this.head = this.cursor = this.indexes.length > 0
        ? this.indexes.shift()!
        : this.length;
      assert(!nodes[index]);
      this.length++;
      nodes[index] = head.prev = head.prev.next =
        new Item(index, key, value, head, head.prev);
      assert(this.length !== 1 || this.nodes[index] === this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      assert(this.length !== 2 || this.nodes[index] !== this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      assert(this.length < 3 || this.nodes[index] !== this.nodes[index]!.prev && this.nodes[index]!.prev !== this.nodes[index]!.next);
      //assert(this.length > 10 || [...this].length === this.length);
      return false;
    }
    else {
      assert(this.length === this.capacity);
      assert(this.indexes.length === 0);
      const index = this.head = this.cursor = nodes[this.head]!.prev.index;
      assert(nodes[index]);
      const garbage = nodes[index]!;
      nodes[index] = head.prev = head.prev.prev.next =
        new Item(index, key, value, head, head.prev.prev);
      assert(this.length !== 1 || this.nodes[index] === this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      assert(this.length !== 2 || this.nodes[index] !== this.nodes[index]!.prev && this.nodes[index]!.prev === this.nodes[index]!.next);
      assert(this.length < 3 || this.nodes[index] !== this.nodes[index]!.prev && this.nodes[index]!.prev !== this.nodes[index]!.next);
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
    const node = this.seek(key, index);
    if (!node) return this.add(key, value);
    assert(this.cursor === node.index);
    this.head = node.index;
    node.value = value;
    return true;
  }
  public shift(): { index: number; key: K; value: V; } | undefined {
    assert(this.length === 0 ? !this.nodes[this.head] : this.nodes[this.head]);
    const node = this.nodes[this.head];
    assert(this.length === 0 ? !node : node);
    if (!node) return;
    this.delete(node.key, node.index);
    return {
      index: node.index,
      key: node.key,
      value: node.value,
    };
  }
  public pop(): { index: number; key: K; value: V; } | undefined {
    assert(this.length === 0 ? !this.nodes[this.head]?.prev : this.nodes[this.head]?.prev);
    const node = this.nodes[this.head]?.prev;
    assert(this.length === 0 ? !node : node);
    if (!node) return;
    this.delete(node.key, node.index);
    return {
      index: node.index,
      key: node.key,
      value: node.value,
    };
  }
  public delete(key: K, index?: number): V | undefined {
    const cursor = this.cursor;
    const node = this.seek(key, index, false);
    if (!node) return;
    this.cursor = cursor;
    assert(this.length > 0);
    assert(this.length !== 1 || node === node.prev && node.prev === node.next);
    assert(this.length !== 2 || node !== node.prev && node.prev === node.next);
    assert(this.length < 3 || node !== node.prev && node.prev !== node.next);
    --this.length;
    this.indexes.push(node.index);
    const { prev, next } = node;
    prev.next = next;
    next.prev = prev;
    // @ts-expect-error
    this.nodes[node.index] = node.prev = node.next = void 0;
    if (this.head === node.index) {
      this.head = next.index;
    }
    if (this.cursor === node.index) {
      this.cursor = next.index;
    }
    assert(this.length === 0 ? !this.nodes[this.cursor] : this.nodes[this.cursor]);
    //assert(this.length > 10 || [...this].length === this.length);
    return node.value;
  }
  public peek(): { index: number; key: K; value: V; } | undefined {
    const node = this.nodes[this.head];
    return node && {
      index: node.index,
      key: node.key,
      value: node.value,
    };
  }
  public node(index: number | undefined): { index: number; key: K; value: V; } | undefined {
    const node = index !== void 0
      ? this.nodes[index]
      : void 0;
    return node && {
      index: this.cursor = node.index,
      key: node.key,
      value: node.value,
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
    for (let node = this.nodes[this.head], i = 0; node && i < this.length; (node = node.next) && ++i) {
      yield [node.key, node.value, node.index];
    }
    return;
  }
  private seek(key: K, cursor: number = this.cursor, aging = true): Item<K, V> | undefined {
    let node = this.nodes[cursor];
    if (!node) return;
    assert(this.nodes[this.head]);
    const newest = this.nodes[this.head]!;
    const isNaN = key !== key;
    if (isNaN ? node.key !== node.key : node.key === key) return this.cursor = cursor, node;
    aging && age(node, false);
    let newer = node;
    const interval = this.interval < this.length
      ? this.interval
      : this.length;
    for (let i = 1; (node = node.next) && i < interval; ++i) {
      if (isNaN ? node.key !== node.key : node.key === key) {
        aging && age(node);
        newer = node.age > newer.age ? node : newer;
        this.head = newer.age > newest.age ? newer.index : newest.index;
        return this.cursor = node.index, node;
      }
      else {
        aging && age(node, false);
        newer = node.age > newer.age ? node : newer;
      }
    }
    this.head = newer.age > newest.age ? newer.index : newest.index;
    this.cursor = node.index;
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

function age<K, V>(node: Item<K, V>, hit?: boolean): Item<K, V>;
function age<K, V>(node: Item<K, V> | undefined, hit?: boolean): Item<K, V> | undefined;
function age<K, V>(node: Item<K, V> | undefined, hit = true): Item<K, V> | undefined {
  if (!node) return;
  node.age >>>= 1;
  node.age |= +hit && 0x80000000;
  node.age >>>= 0;
  assert(node.age === node.age >>> 0);
  return node;
}
