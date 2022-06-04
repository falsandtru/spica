import { Infinity, Map } from './global';
import { now } from './clock';
import { IterableCollection } from './collection';
import { List, Node } from './invlist';
import { extend } from './assign';
import { tuple } from './tuple';

// Dual Window Cache

/*
LFU論理寿命：小容量で小効果のみにつきLRU下限で代替し廃止
LRU下限：小容量で大効果につき採用
LFUヒット率変化率：効果確認できないが必要と思われるので残置
*/

/*
比較検討

CLOCK/CAR:
木構造と両立しない。

ARC:
すでにARCに近いヒット率を達成しているためオーバーヘッド増加によるスループット低下に見合う
ヒット率向上がありJavaScriptに適したワークロードを見つけなければならない。
キャッシュサイズの2倍のキーを必要とすることがアルゴリズムとして忌避される場合がある。

LIRS:
ARCと比較して大幅に性能が高いとは言えないうえ性能の劣るケースが散見される。
キャッシュサイズの最大3倍のキーを保持する。

TinyLFU:
一部のワークロードへの最適化、アドミッションポリシーの相性、およびウインドウキャッシュの小ささから
メモ化などの小規模使用においてLRUに大きく劣るか機能しない可能性がある。
またおそらくオブジェクトをキーに使用できない。

https://github.com/ben-manes/caffeine/wiki/Efficiency

*/

interface Index<K> {
  readonly key: K;
  size: number;
  expiry: number;
  region: 'LRU' | 'LFU';
  node?: Node<Index<K>>;
  overlap?: Node<Index<K>>;
}
interface Record<K, V> {
  readonly index: Node<Index<K>>;
  value: V;
}

export namespace Cache {
  export interface Options<K, V = undefined> {
    readonly capacity?: number;
    readonly space?: number;
    readonly age?: number;
    readonly overlap?: boolean;
    readonly limit?: number;
    readonly disposer?: (value: V, key: K) => void;
    readonly capture?: {
      readonly delete?: boolean;
      readonly clear?: boolean;
    };
  }
}
export class Cache<K, V = undefined> implements IterableCollection<K, V> {
  constructor(capacity: number, opts?: Cache.Options<K, V>);
  constructor(opts: Cache.Options<K, V>);
  constructor(
    capacity: number | Cache.Options<K, V>,
    opts: Cache.Options<K, V> = {},
  ) {
    if (typeof capacity === 'object') {
      opts = capacity;
      capacity = opts.capacity ?? 0;
    }
    extend(this.settings, opts, {
      capacity,
    });
    this.capacity = this.settings.capacity!;
    if (this.capacity >= 1 === false) throw new Error(`Spica: Cache: Capacity must be 1 or more.`);
    this.space = this.settings.space!;
    this.overlap = this.settings.overlap!;
    this.limit = this.settings.limit!;
  }
  private readonly settings: Cache.Options<K, V> = {
    capacity: 0,
    space: Infinity,
    age: Infinity,
    overlap: true,
    limit: 95,
    capture: {
      delete: true,
      clear: true,
    },
  };
  private readonly capacity: number;
  private readonly space: number;
  private readonly overlap: boolean;
  private SIZE = 0;
  private memory = new Map<K, Record<K, V>>();
  private readonly indexes = {
    LRU: new List<Index<K>>(),
    LFU: new List<Index<K>>(),
    OVL: new List<Index<K>>(),
  } as const;
  public get length(): number {
    //assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size);
    return this.indexes.LRU.length + this.indexes.LFU.length;
  }
  public get size(): number {
    return this.SIZE;
  }
  private evict(node: Node<Index<K>>, record: Record<K, V> | undefined, callback: boolean): void {
    assert(this.indexes.OVL.length <= this.indexes.LRU.length);
    assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size);
    const index = node.value;
    callback &&= !!this.settings.disposer;
    record = callback
      ? record ?? this.memory.get(index.key)
      : record;
    assert(node.list);
    assert(node.list !== this.indexes.OVL);
    node.delete();
    node.value.overlap?.delete();
    assert(this.indexes.OVL.length <= this.indexes.LRU.length);
    assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size - 1);
    this.memory.delete(index.key);
    assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size);
    this.SIZE -= index.size;
    callback && this.settings.disposer?.(record!.value, index.key);
  }
  private ensure(margin: number, skip?: Node<Index<K>>): void {
    if (skip) {
      // Prevent wrong disposal of `skip`.
      skip.value.expiry = Infinity;
    }
    let size = skip?.value.size ?? 0;
    assert(margin - size <= this.space);
    if (margin - size <= 0) return;
    const { LRU, LFU, OVL } = this.indexes;
    while (this.length === this.capacity || this.size + margin - size > this.space) {
      assert(this.length >= 1 + +!!skip);
      const lastNode = OVL.last ?? LFU.last;
      const lastIndex = lastNode?.value;
      let target: Node<Index<K>>;
      switch (true) {
        // NOTE: The following conditions must be ensured that they won't be true if `lastNode` is `skip`.
        case lastIndex && lastIndex.expiry !== Infinity && lastIndex.expiry < now():
          target = lastNode!.list === OVL
            ? lastNode!.value.node!
            : lastNode!;
          assert(target.list !== this.indexes.OVL);
          break;
        case LRU.length === 0:
          target = LFU.last! !== skip
            ? LFU.last!
            : LFU.last!.prev;
          break;
        // @ts-expect-error
        case LFU.length > this.capacity * this.ratio / 100:
          target = LFU.last! !== skip
            ? LFU.last!
            : LFU.length >= 2
              ? LFU.last!.prev
              : skip;
          if (target !== skip) {
            if (this.ratio > 50) break;
            target.value.node = LRU.unshiftNode(target);
            if (this.overlap) {
              target.value.overlap = OVL.unshift(target.value);
            }
            assert(OVL.length <= LRU.length);
          }
          // fallthrough
        default:
          assert(LRU.last);
          target = LRU.last! !== skip
            ? LRU.last!
            : LRU.length >= 2
              ? LRU.last!.prev
              : LFU.last!;
      }
      assert(target !== skip);
      assert(this.memory.has(target.value.key));
      this.evict(target, void 0, true);
      skip = skip?.list && skip;
      size = skip?.value.size ?? 0;
    }
  }
  public put(key: K, value: V, size?: number, age?: number): boolean;
  public put(this: Cache<K, undefined>, key: K, value?: V, size?: number, age?: number): boolean;
  public put(key: K, value: V, size: number = 1, age: number = this.settings.age!): boolean {
    if (size >= 1 === false) throw new Error(`Spica: Cache: Size must be 1 or more.`);
    if (age >= 1 === false) throw new Error(`Spica: Cache: Age must be 1 or more.`);
    if (size > this.space || age <= 0) {
      this.settings.disposer?.(value, key);
      return false;
    }

    const expiry = age === Infinity
      ? Infinity
      : now() + age;
    const record = this.memory.get(key);
    if (record) {
      const node = record.index;
      const val = record.value;
      const index = node.value;
      this.ensure(size, node);
      assert(this.memory.has(key));
      index.expiry = expiry;
      this.SIZE += size - index.size;
      assert(0 < this.size && this.size <= this.space);
      index.size = size;
      record.value = value;
      this.settings.disposer?.(val, key);
      return true;
    }
    this.ensure(size);
    assert(!this.memory.has(key));

    const { LRU } = this.indexes;
    assert(LRU.length !== this.capacity);
    this.SIZE += size;
    assert(0 < this.size && this.size <= this.space);
    this.memory.set(key, {
      index: LRU.unshift({
        key,
        size,
        expiry,
        region: 'LRU',
      }),
      value,
    });
    return false;
  }
  public set(key: K, value: V, size?: number, age?: number): this;
  public set(this: Cache<K, undefined>, key: K, value?: V, size?: number, age?: number): this;
  public set(key: K, value: V, size?: number, age?: number): this {
    this.put(key, value, size, age);
    return this;
  }
  public get(key: K): V | undefined {
    const record = this.memory.get(key);
    if (!record) return;
    const node = record.index;
    const expiry = node.value.expiry;
    if (expiry !== Infinity && expiry < now()) {
      this.evict(node, record, true);
      return;
    }
    // Optimization for memoize.
    if (this.capacity > 3 && node === node.list.head) return record.value;
    this.access(node);
    this.slide();
    return record.value;
  }
  public has(key: K): boolean {
    //assert(this.memory.has(key) === (this.indexes.LFU.has(key) || this.indexes.LRU.has(key)));
    //assert(this.memory.size === this.indexes.LFU.length + this.indexes.LRU.length);
    const record = this.memory.get(key);
    if (!record) return false;
    const expiry = record.index.value.expiry;
    if (expiry !== Infinity && expiry < now()) {
      this.evict(record.index, record, true);
      return false;
    }
    return true;
  }
  public delete(key: K): boolean {
    const record = this.memory.get(key);
    if (!record) return false;
    this.evict(record.index, record, this.settings.capture!.delete === true);
    return true;
  }
  public clear(): void {
    this.SIZE = 0;
    this.ratio = 50;
    this.stats.clear();
    this.indexes.LRU.clear();
    this.indexes.LFU.clear();
    this.indexes.OVL.clear();
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
  private readonly stats = {
    LRU: tuple(0, 0),
    LFU: tuple(0, 0),
    slide(): void {
      const { LRU, LFU } = this;
      LRU[1] = LRU[0];
      LRU[0] = 0;
      LFU[1] = LFU[0];
      LFU[0] = 0;
    },
    clear(): void {
      const { LRU, LFU } = this;
      LRU[0] = LRU[1] = 0;
      LFU[0] = LFU[1] = 0;
    },
  } as const;
  private ratio = 50;
  private readonly limit: number;
  private slide(): void {
    const { LRU, LFU } = this.stats;
    const { capacity, ratio, limit, indexes } = this;
    const window = capacity;
    LRU[0] + LFU[0] === window && this.stats.slide();
    if ((LRU[0] + LFU[0]) * 100 % capacity || LRU[1] + LFU[1] === 0) return;
    const lenR = indexes.LRU.length;
    const lenF = indexes.LFU.length;
    const lenV = indexes.OVL.length;
    const r = (lenF + lenV) * 1000 / (lenR + lenF) | 0;
    const rateR0 = rate(window, LRU[0], LRU[0] + LFU[0], LRU[1], LRU[1] + LFU[1], 0) * (1 + r);
    const rateF0 = rate(window, LFU[0], LRU[0] + LFU[0], LFU[1], LRU[1] + LFU[1], 0) * (1001 - r);
    const rateF1 = rate(window, LFU[1], LRU[1] + LFU[1], LFU[0], LRU[0] + LFU[0], 5) * (1001 - r);
    // 操作頻度を超えてキャッシュ比率を増減させても余剰比率の消化が追いつかず無駄
    // LRUの下限設定ではLRU拡大の要否を迅速に判定できないためLFUのヒット率低下の検出で代替する
    if (ratio > 0 && (rateR0 > rateF0 || rateF0 < rateF1 * 0.95)) {
      if (lenR >= capacity * (100 - ratio) / 100) {
        //ratio % 10 || ratio === 100 || console.debug('-', ratio, LRU, LFU);
        --this.ratio;
      }
    }
    else
    if (ratio < limit && rateF0 > rateR0) {
      if (lenF >= capacity * ratio / 100) {
        //ratio % 10 || ratio === 0 || console.debug('+', ratio, LRU, LFU);
        ++this.ratio;
      }
    }
  }
  private access(node: Node<Index<K>>): boolean {
    return this.accessLFU(node)
        || this.accessLRU(node);
  }
  private accessLRU(node: Node<Index<K>>): boolean {
    assert(node.list === this.indexes.LRU);
    const index = node.value;
    ++this.stats[index.region][0];
    assert(this.indexes.LFU.length < this.capacity);
    index.region = 'LFU';
    index.overlap?.delete();
    index.overlap = void 0;
    this.indexes.LFU.unshiftNode(node);
    return true;
  }
  private accessLFU(node: Node<Index<K>>): boolean {
    const index = node.value;
    if (node.list !== this.indexes.LFU) return false;
    ++this.stats[index.region][0];
    node.moveToHead();
    return true;
  }
}

function rate(window: number, currHits: number, currTotal: number, prevHits: number, prevTotal: number, offset: number): number {
  assert(currTotal <= window);
  const prevRate = prevHits * 100 / prevTotal | 0;
  const currRatio = currTotal * 100 / window - offset | 0;
  if (currRatio <= 0) return prevRate * 100;
  const currRate = currHits * 100 / currTotal | 0;
  const prevRatio = 100 - currRatio;
  return currRate * currRatio + prevRate * prevRatio;
}
assert(rate(10, 4, 10, 0, 0, 0) === 4000);
assert(rate(10, 0, 0, 4, 10, 0) === 4000);
assert(rate(10, 1, 5, 4, 10, 0) === 3000);
assert(rate(10, 0, 0, 4, 10, 5) === 4000);
assert(rate(10, 1, 5, 2, 10, 5) === 2000);
assert(rate(10, 2, 5, 2, 10, 5) === 2900);
