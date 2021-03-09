import { Infinity, Map } from './global';
import { max, min } from './alias';
import { now } from './clock';
import { IterableCollection } from './collection';
import { IxList } from './ixlist';
import { extend } from './assign';
import { tuple } from './tuple';
import { equal } from './compare';

// Dual Window Cache

// Note: The logical clocks of a cache will overflow after 1041 days in 100,000,000 ops/sec.

/*
この実装はオーバーヘッド削減を優先して論理クロックのリセットを実装していないが他の高速な言語で
これが問題になる場合はクロックの世代管理を行うだけでよいと思われる。
*/

/*
比較検討

ARC:
ゴーストキャッシュの追加による走査コストおよびオーバヘッドの倍化を補えるほどのヒット率の増加を期待できない。

CLOCK(CAR):
当実装の探索高速化手法および木構造と両立しない。

TinyLFU:
一部のワークロードへの最適化、アドミッションポリシーの相性、およびウインドウキャッシュの小ささから
メモ化など他の用途においてLRUに大きく劣るか機能しない懸念がある。
またキーの型の制限、オーバーヘッドの影響度、ならびに想定される前提条件および合理的推定の不一致から
JavaScriptにおける需要を満たさない懸念がある。

*/

interface Record<V> {
  target: 'LRU' | 'LFU';
  index: number;
  value: V;
  size: number;
  expiry: number;
};

export interface CacheOptions<K, V = undefined> {
  readonly space?: number;
  readonly age?: number;
  readonly disposer?: (value: V, key: K) => void;
  readonly capture?: {
    readonly delete?: boolean;
    readonly clear?: boolean;
  };
}

export class Cache<K, V = undefined> implements IterableCollection<K, V> {
  constructor(
    private readonly capacity: number,
    opts: CacheOptions<K, V> = {},
  ) {
    if (capacity < 1) throw new Error(`Spica: Cache: Capacity must be 1 or more.`);
    extend(this.settings, opts);
    this.space = this.settings.space!;
  }
  private readonly settings: CacheOptions<K, V> = {
    space: 0,
    age: Infinity,
    capture: {
      delete: true,
      clear: true,
    },
  };
  private readonly space: number;
  private SIZE = 0;
  // 1041 days < 2 ** 53 / 100,000,000 / 3600 / 24.
  private clock = 0;
  private clockR = 0;
  private memory = new Map<K, Record<V>>();
  private readonly indexes = {
    LRU: new IxList<K, number>(this.capacity),
    LFU: new IxList<K, number>(this.capacity),
  } as const;
  public get length(): number {
    //assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size);
    return this.indexes.LRU.length + this.indexes.LFU.length;
  }
  public get size(): number {
    return this.SIZE;
  }
  private stack: { [i: number]: { key: K; value: V; }; length: number; } = { length: 0 };
  private resume(): void {
    if (this.stack.length === 0) return;
    const { stack, settings: { disposer } } = this;
    assert(disposer);
    while (stack.length > 0) {
      const { key, value } = stack[--stack.length];
      disposer!(value, key);
    }
  }
  private dispose(key: K, { target, index, value, size }: Record<V>, disposer: CacheOptions<K, V>['disposer']): void {
    this.indexes[target].del(key, index);
    this.memory.delete(key);
    this.space && (this.SIZE -= size);
    disposer?.(value, key);
  }
  private secure(margin: number, key?: K): void {
    assert(!this.space || margin <= this.space);
    if (margin <= 0) return;
    const { LRU, LFU } = this.indexes;
    let miss: false | undefined = arguments.length < 2 ? false : void 0;
    let restore: IxList<K, number> | undefined;
    while (this.length === this.capacity || this.space && this.size + margin > this.space) {
      const list = false
        || LRU.length === +(restore === LRU)
        || LFU.length > this.capacity * this.ratio / 100
        || LFU.length > this.capacity / 2 && LFU.last!.value < this.clock - this.capacity * 8
        ? LFU
        : LRU;
      const index = list.last!;
      assert(this.memory.has(index.key));
      if (miss ?? equal(index.key, key)) {
        miss = false;
        assert(!restore);
        restore = list;
        assert(restore.last!.index === index.index);
        restore.HEAD = index.index;
        continue;
      }
      const record = this.memory.get(index.key)!;
      this.dispose(index.key, record, void 0);
      this.settings.disposer && (this.stack[this.stack.length++] = { key: index.key, value: record.value });
    }
    if (restore && restore.length > 0) {
      restore.HEAD = restore.tail!.index;
    }
  }
  public put(this: Cache<K, undefined>, key: K, value?: V, size?: number, age?: number): boolean;
  public put(key: K, value: V, size?: number, age?: number): boolean;
  public put(key: K, value: V, size: number = 1, age: number = this.settings.age!): boolean {
    if (size < 1) throw new Error(`Spica: Cache: Size must be 1 or more.`);
    if (age < 1) throw new Error(`Spica: Cache: Age must be 1 or more.`);
    if (this.space && size > this.space || age <= 0) {
      this.settings.disposer?.(value, key);
      return false;
    }

    const expiry = age === Infinity
      ? Infinity
      : now() + age;
    const record = this.memory.get(key);
    if (record) {
      assert(this.memory.has(key));
      this.settings.disposer && (this.stack[this.stack.length++] = { key, value: record.value });
      this.secure(size - record.size, key);
      this.space && (this.SIZE += size - record.size);
      assert(0 <= this.size && this.size <= this.space);
      record.value = value;
      record.size = size;
      record.expiry = expiry;
      this.resume();
      assert(this.stack.length === 0);
      return true;
    }
    this.secure(size);
    assert(!this.memory.has(key));

    const { LRU } = this.indexes;
    this.space && (this.SIZE += size);
    assert(0 <= this.size && this.size <= this.space);
    this.memory.set(key, {
      target: 'LRU',
      index: LRU.add(key, ++this.clockR),
      value,
      size,
      expiry,
    });
    this.resume();
    assert(this.stack.length === 0);
    return false;
  }
  public set(this: Cache<K, undefined>, key: K, value?: V, size?: number, age?: number): this;
  public set(key: K, value: V, size?: number, age?: number): this;
  public set(key: K, value: V, size?: number, age?: number): this {
    this.put(key, value, size, age);
    return this;
  }
  public get(key: K): V | undefined {
    const record = this.memory.get(key);
    if (!record) return;
    if (record.expiry !== Infinity && record.expiry <= now()) {
      this.dispose(key, record, this.settings.disposer);
      return;
    }
    this.access(key, record);
    this.slide();
    return record.value;
  }
  public has(key: K): boolean {
    //assert(this.memory.has(key) === (this.indexes.LFU.has(key) || this.indexes.LRU.has(key)));
    //assert(this.memory.size === this.indexes.LFU.length + this.indexes.LRU.length);
    const record = this.memory.get(key);
    if (!record) return false;
    if (record.expiry !== Infinity && record.expiry <= now()) {
      this.dispose(key, record, this.settings.disposer);
      return false;
    }
    return true;
  }
  public delete(key: K): boolean {
    const record = this.memory.get(key);
    if (!record) return false;
    this.dispose(key, record, this.settings.capture!.delete ? this.settings.disposer : void 0);
    return true;
  }
  public clear(): void {
    this.SIZE = 0;
    this.ratio = 50;
    this.indexes.LRU.clear();
    this.indexes.LFU.clear();
    this.stack = { length: 0 };
    this.stats = {
      LRU: [0, 0],
      LFU: [0, 0],
    };
    if (!this.settings.disposer || !this.settings.capture!.clear) return void this.memory.clear();
    const memory = this.memory;
    this.memory = new Map();
    for (const [key, { value }] of memory) {
      this.settings.disposer(value, key);
    }
  }
  public *[Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    for (const [key, { value }] of this.memory) {
      yield [key, value];
    }
    return;
  }
  private stats = {
    LRU: tuple(0, 0),
    LFU: tuple(0, 0),
  };
  private ratio = 50;
  private readonly frequency = max(this.capacity / 100 | 0, 1);
  private slide(): void {
    const { LRU, LFU } = this.stats;
    const { capacity, ratio, indexes } = this;
    if ((LRU[0] + LFU[0]) % this.frequency) return;
    const window = capacity;
    const isCalculable = LRU[1] + LFU[1] > 0;
    const rateR = +isCalculable && rate(window, LRU[0], LRU[0] + LFU[0], LRU[1], LRU[1] + LFU[1]);
    const rateF = +isCalculable && rate(window, LFU[0], LRU[0] + LFU[0], LFU[1], LRU[1] + LFU[1]) * indexes.LRU.length / indexes.LFU.length | 0;
    if (isCalculable && ratio < 100 && rateF > rateR && indexes.LFU.length >= capacity * ratio / 100) {
      //ratio % 10 || console.debug('+', this.ratio, LRU, LFU);
      ++this.ratio;
    }
    // LRUに収束させない
    else
    if (isCalculable && ratio > 10 && rateR > rateF && indexes.LRU.length >= capacity * (100 - ratio) / 100) {
      //ratio % 10 || console.debug('-', this.ratio, LRU, LFU);
      --this.ratio;
    }
    if (LRU[0] + LFU[0] >= window) {
      this.stats = {
        LRU: [0, LRU[0]],
        LFU: [0, LFU[0]],
      };
    }
  }
  private access(key: K, record: Record<V>): boolean {
    return this.accessLFU(key, record)
        || this.accessLRU(key, record);
  }
  private accessLRU(key: K, record: Record<V>): boolean {
    if (record.target !== 'LRU') return false;
    const { LRU, LFU } = this.indexes;
    const { index } = record;
    assert(LRU.node(index)!.key === key);
    ++this.stats.LRU[0];
    ++this.clock;
    ++this.clockR;
    if (LRU.node(index)!.value + LRU.length / 3 > this.clockR) {
      LRU.put(key, this.clockR, index);
      LRU.moveToHead(index);
      return true;
    }
    LRU.del(key, index);
    record.target = 'LFU';
    record.index = LFU.add(key, this.clock);
    return true;
  }
  private accessLFU(key: K, record: Record<V>): boolean {
    if (record.target !== 'LFU') return false;
    const { LFU } = this.indexes;
    const { index } = record;
    assert(LFU.node(index)!.key === key);
    ++this.stats.LFU[0];
    ++this.clock;
    LFU.put(key, this.clock, index);
    LFU.moveToHead(index);
    return true;
  }
}

function rate(window: number, currHits: number, currTotal: number, prevHits: number, prevTotal: number): number {
  window = min(currTotal + prevTotal, window);
  const currRate = currHits * 100 / currTotal | 0;
  const currRatio = min(currTotal * 100 / window | 0, 100);
  const prevRate = prevHits * 100 / prevTotal | 0;
  const prevRatio = 100 - currRatio;
  return currRate * currRatio + prevRate * prevRatio | 0;
}
assert(rate(10, 5, 10, 0, 0) === 5000);
assert(rate(10, 0, 0, 5, 10) === 5000);
