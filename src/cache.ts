import { Infinity, Number, Map } from './global';
import { max, min } from './alias';
import { now } from './clock';
import { IterableCollection } from './collection';
import { List, Node } from './invlist';
import { extend } from './assign';
import { tuple } from './tuple';

// Dual Window Cache

// Note: The logical clocks of a cache will overflow after 1041 days in 100,000,000 ops/sec.

/*
キャッシュ比率をLFU論理寿命、LFUヒット率変化率、LRU下限により実験的に調整しているがこれらの要否は後で判断する。

この実装はオーバーヘッド削減を優先して論理クロックのリセットを実装していないが
他の高速な言語でこれが問題となる場合はクロックのオーバーフローを利用して補正処理を行う方法が考えられ
この場合十分大きなクロック上では世代の混同が生じる前にキャッシュの更新または破棄が完了すると期待でき
わずかに前世代のキャッシュが混入したとしても一時的にわずかにキャッシュ効率が低下する程度の影響しかない。

```
assert(max(this.clock) > this.life * 10);
const offset = this.clock >= 0 && LFU.last.clock >= 0
  ? 0
  : this.life;
if (LFU.last.clock + offset < this.clock - this.life + offset) {
  LFU.pop();
}
```
*/

/*
比較検討

ARC:
操作コストの大幅な増加によりLRU上位互換に要求される速度性能を満たせない懸念がある。

CLOCK(CAR):
木構造と両立しない。

TinyLFU:
一部のワークロードへの最適化、アドミッションポリシーの相性、およびウインドウキャッシュの小ささから
メモ化など他の用途においてLRUに大きく劣るか機能しない懸念がある。
またキーの型の制限、オーバーヘッドの影響度、ならびに想定される前提条件および合理的推定の不一致から
JavaScriptにおける需要を満たさない懸念がある。

*/

interface Index<K> {
  key: K;
  size: number;
  clock: number;
  expiry: number;
  stat: [number, number];
}
interface Record<K, V> {
  index: Node<Index<K>>;
  value: V;
}

export interface CacheOptions<K, V = undefined> {
  readonly space?: number;
  readonly age?: number;
  readonly life?: number;
  readonly limit?: number;
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
    if (capacity >= 1 === false) throw new Error(`Spica: Cache: Capacity must be 1 or more.`);
    extend(this.settings, opts);
    this.space = this.settings.space!;
    this.life = this.capacity * this.settings.life!;
    this.limit = this.settings.limit!;
  }
  private readonly settings: CacheOptions<K, V> = {
    space: Infinity,
    age: Infinity,
    life: 10,
    limit: 95,
    capture: {
      delete: true,
      clear: true,
    },
  };
  private readonly life: number;
  private readonly space: number;
  private SIZE = 0;
  // 1041 days < 2 ** 53 / 100,000,000 / 3600 / 24.
  // Hit counter only for LFU.
  private clock = Number.MIN_SAFE_INTEGER;
  // LRU access counter only for LRU.
  private clockR = Number.MIN_SAFE_INTEGER;
  private memory = new Map<K, Record<K, V>>();
  private readonly indexes = {
    LRU: new List<Index<K>>(),
    LFU: new List<Index<K>>(),
  } as const;
  public get length(): number {
    //assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size);
    return this.indexes.LRU.length + this.indexes.LFU.length;
  }
  public get size(): number {
    return this.SIZE;
  }
  private dispose(node: Node<Index<K>>, record: Record<K, V> | undefined, callback: boolean): void {
    const index = node.value;
    callback &&= !!this.settings.disposer;
    record = callback
      ? record ?? this.memory.get(index.key)
      : record;
    assert(node.list);
    node.delete();
    this.memory.delete(index.key);
    this.SIZE -= index.size;
    callback && this.settings.disposer?.(record!.value, index.key);
  }
  private ensure(margin: number, skip?: Node<Index<K>>): void {
    let size = skip?.value.size ?? 0;
    assert(margin - size <= this.space);
    if (margin - size <= 0) return;
    const { LRU, LFU } = this.indexes;
    while (this.length === this.capacity || this.size + margin - size > this.space) {
      const lastLFU = LFU.last?.value;
      let node: Node<Index<K>>;
      switch (true) {
        // @ts-expect-error
        case LFU.length > this.capacity * this.ratio / 100:
          node = LRU.unshiftNode(LFU.last!);
          node.value.clock -= this.clock - ++this.clockR;
        case !lastLFU:
        default:
          node = LRU.last === skip
            ? LRU.last!.prev!
            : LRU.last!;
          break;
        case LRU.length === 0:
        case LRU.length === 1 && LRU.last === skip:
        // LRUの下限を5%以上確保すればわずかな性能低下と引き換えに消して一般化できる
        case lastLFU!.clock < this.clock - this.life:
        case lastLFU!.expiry !== Infinity && lastLFU!.expiry < now():
          node = LFU.last!;
          break;
      }
      assert(node !== skip);
      assert(this.memory.has(node.value.key));
      this.dispose(node, void 0, true);
      skip = skip?.list ? skip : void 0;
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
      this.ensure(size, node);
      assert(this.memory.has(key));
      const index = node.value;
      this.SIZE += size - index.size;
      assert(0 <= this.size && this.size <= this.space);
      record.value = value;
      index.size = size;
      index.expiry = expiry;
      this.settings.disposer?.(val, key);
      return true;
    }
    this.ensure(size);
    assert(!this.memory.has(key));

    const { LRU } = this.indexes;
    assert(LRU.length !== this.capacity);
    this.SIZE += size;
    assert(0 <= this.size && this.size <= this.space);
    this.memory.set(key, {
      index: LRU.unshift({
        key,
        size,
        clock: ++this.clockR,
        expiry,
        stat: this.stats.LRU,
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
      this.dispose(node, record, true);
      return;
    }
    // Optimization for memoize.
    if (this.capacity >= 10 && node === node.list.head) return record.value;
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
      this.dispose(record.index, record, true);
      return false;
    }
    return true;
  }
  public delete(key: K): boolean {
    const record = this.memory.get(key);
    if (!record) return false;
    this.dispose(record.index, record, this.settings.capture!.delete === true);
    return true;
  }
  public clear(): void {
    this.SIZE = 0;
    this.ratio = 50;
    this.stats.clear();
    this.indexes.LRU.clear();
    this.indexes.LFU.clear();
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
  private readonly frequency = max(this.capacity / 100 | 0, 1);
  private slide(): void {
    const { LRU, LFU } = this.stats;
    const { capacity, frequency, ratio, limit, indexes } = this;
    const window = capacity;
    LRU[0] + LFU[0] === window && this.stats.slide();
    if ((LRU[0] + LFU[0]) % frequency || LRU[1] + LFU[1] === 0) return;
    const rateR = rate(window, LRU[0], LRU[0] + LFU[0], LRU[1], LRU[1] + LFU[1]) * (50 + ratio);
    const rateF = rate(window, LFU[0], LRU[0] + LFU[0], LFU[1], LRU[1] + LFU[1]) * (150 - ratio);
    // 操作頻度を超えてキャッシュ比率を増減させても余剰比率の消化が追いつかず無駄
    // LRUの下限設定ではLRU拡大の要否を迅速に判定できないためLFUのヒット率低下の検出で代替する
    if (ratio > 0 && rateR > rateF ||
        ratio > 0 && rateF * 3 < rate(window, LFU[1], LRU[1] + LFU[1], LFU[0], LRU[0] + LFU[0]) * (150 - ratio)) {
      if (indexes.LRU.length >= capacity * (100 - ratio) / 100) {
        //ratio % 10 || ratio === 100 || console.debug('-', this.ratio, LRU, LFU);
        --this.ratio;
      }
    }
    else
    if (ratio < limit && rateF > rateR) {
      if (indexes.LFU.length >= capacity * ratio / 100) {
        //ratio % 10 || ratio === 0 || console.debug('+', this.ratio, LRU, LFU);
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
    const { LRU, LFU } = this.indexes;
    ++index.stat[0];
    ++this.clock;
    ++this.clockR;
    // Prevent LFU destruction.
    if (index.clock > this.clockR - LRU.length / 3 && index.stat === this.stats.LRU) {
      index.clock = this.clockR;
      node.moveToHead();
      return true;
    }
    assert(LFU.length !== this.capacity);
    index.clock = this.clock;
    index.stat = this.stats.LFU;
    LFU.unshiftNode(node);
    return true;
  }
  private accessLFU(node: Node<Index<K>>): boolean {
    const index = node.value;
    const { LFU } = this.indexes;
    if (node.list !== LFU) return false;
    ++index.stat[0];
    ++this.clock;
    index.clock = this.clock;
    node.moveToHead();
    return true;
  }
}

function rate(window: number, currHits: number, currTotal: number, prevHits: number, prevTotal: number): number {
  window = min(currTotal + prevTotal, window);
  const currRate = currHits * 100 / currTotal | 0;
  const currRatio = min(currTotal * 100 / window | 0, 100);
  const prevRate = prevHits * 100 / prevTotal | 0;
  const prevRatio = 100 - currRatio;
  return currRate * currRatio + prevRate * prevRatio;
}
assert(rate(10, 5, 10, 0, 0) === 5000);
assert(rate(10, 0, 0, 5, 10) === 5000);
