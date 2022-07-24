import { Infinity, Map } from './global';
import { now } from './clock';
import { IterableDict } from './dict';
import { List } from './invlist';
import { Heap } from './heap';
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
キャッシュサイズの2倍のキーを保持することが空間効率の観点から許容されない場合がある。

LIRS:
キャッシュサイズの最大3倍のキーを保持する。
にもかかわらずARCと比較して大幅に性能が高いとは言えないうえ性能の劣るケースが散見される。

TinyLFU:
一部のワークロードへの最適化、アドミッションポリシーの相性、およびウインドウキャッシュの小ささから
メモ化などの小規模使用においてLRUに大きく劣るか機能しない可能性がある。
またおそらくオブジェクトをキーに使用できない。

https://github.com/ben-manes/caffeine/wiki/Efficiency

*/

/*
lru-cacheの最適化分析

## Map値の数値化

Mapは値が数値の場合2倍高速化される。

## インデクスアクセス化

個別の状態を個別のオブジェクトのプロパティに持たせると最適化されていないプロパティアクセスにより
低速化するためすべての状態を状態別の配列に格納しインデクスアクセスに変換することで高速化している。
DWCはこの最適化を行っても状態数の多さに比例して増加したオーバーヘッドに相殺され効果を得られない。
状態をオブジェクトの代わりに配列に入れても最適化されずプロパティ・インデクスとも二段のアクセスは
最適化されないと思われる。
しかしであればこの最適化は自身が他のオブジェクトのプロパティとして使用された場合二段アクセスになり
最適化が適用されないのではないかという疑問が生じる。

*/

interface Index<K, V> {
  readonly key: K;
  value: V;
  size: number;
  expiry: number;
  enode?: Heap.Node<List.Node<Index<K, V>>>;
  region: 'LRU' | 'LFU';
}

export namespace Cache {
  export interface Options<K, V = undefined> {
    readonly capacity?: number;
    readonly space?: number;
    readonly age?: number;
    readonly earlyExpiring?: boolean;
    readonly limit?: number;
    readonly disposer?: (value: V, key: K) => void;
    readonly capture?: {
      readonly delete?: boolean;
      readonly clear?: boolean;
    };
  }
}
export class Cache<K, V = undefined> implements IterableDict<K, V> {
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
    this.limit = this.settings.limit!;
    this.earlyExpiring = this.settings.earlyExpiring!;
    this.disposer = this.settings.disposer!;
  }
  private readonly settings: Cache.Options<K, V> = {
    capacity: 0,
    space: Infinity,
    age: Infinity,
    earlyExpiring: false,
    limit: 950,
    capture: {
      delete: true,
      clear: true,
    },
  };
  private readonly capacity: number;
  private readonly space: number;
  private overlap = 0;
  private SIZE = 0;
  private memory = new Map<K, List.Node<Index<K, V>>>();
  private readonly indexes = {
    LRU: new List<Index<K, V>>(),
    LFU: new List<Index<K, V>>(),
  } as const;
  private readonly expiries = new Heap<List.Node<Index<K, V>>>((a, b) => a.value.expiry - b.value.expiry);
  private readonly earlyExpiring: boolean;
  private readonly disposer?: (value: V, key: K) => void;
  public get length(): number {
    //assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size);
    return this.indexes.LRU.length + this.indexes.LFU.length;
  }
  public get size(): number {
    return this.SIZE;
  }
  private evict(node: List.Node<Index<K, V>>, callback: boolean): void {
    assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size);
    const index = node.value;
    callback &&= !!this.disposer;
    assert(node.list);
    this.overlap -= +(index.region === 'LFU' && node.list === this.indexes.LRU);
    assert(this.overlap >= 0);
    index.enode && this.expiries.delete(index.enode);
    node.delete();
    assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size - 1);
    this.memory.delete(index.key);
    assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size);
    this.SIZE -= index.size;
    callback && this.disposer?.(node.value.value, index.key);
  }
  private ensure(margin: number, skip?: List.Node<Index<K, V>>): void {
    let size = skip?.value.size ?? 0;
    assert(margin - size <= this.space);
    if (margin - size <= 0) return;
    const { LRU, LFU } = this.indexes;
    while (this.length === this.capacity || this.size + margin - size > this.space) {
      assert(this.length >= 1 + +!!skip);
      let target: List.Node<Index<K, V>>;
      switch (true) {
        case (target = this.expiries.peek()!)
          && target !== skip
          && target.value.expiry < now():
          assert(target = target!);
          break;
        case LRU.length === 0:
          target = LFU.last! !== skip
            ? LFU.last!
            : LFU.last!.prev;
          break;
        // @ts-expect-error
        case LFU.length > this.capacity * this.ratio / 1000:
          target = LFU.last! !== skip
            ? LFU.last!
            : LFU.length >= 2
              ? LFU.last!.prev
              : skip;
          if (target !== skip) {
            if (this.ratio > 500) break;
            LRU.unshiftNode(target);
            ++this.overlap;
            assert(this.overlap <= LRU.length);
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
      this.evict(target, true);
      skip = skip?.list && skip;
      size = skip?.value.size ?? 0;
    }
  }
  public put(key: K, value: V, opts?: { size?: number; age?: number; }): boolean;
  public put(this: Cache<K, undefined>, key: K, value?: V, opts?: { size?: number; age?: number; }): boolean;
  public put(key: K, value: V, { size = 1, age = this.settings.age! }: { size?: number; age?: number; } = {}): boolean {
    if (size > this.space || age <= 0) {
      this.disposer?.(value, key);
      return false;
    }

    const expiry = age === Infinity
      ? Infinity
      : now() + age;
    const node = this.memory.get(key);
    if (node) {
      const val = node.value.value;
      const index = node.value;
      this.ensure(size, node);
      assert(this.memory.has(key));
      this.SIZE += size - index.size;
      assert(0 < this.size && this.size <= this.space);
      index.size = size;
      index.expiry = expiry;
      if (this.earlyExpiring && expiry !== Infinity) {
        index.enode
          ? this.expiries.update(index.enode)
          : index.enode = this.expiries.insert(node);
        assert(this.expiries.length <= this.length);
      }
      else if (index.enode) {
        this.expiries.delete(index.enode);
        index.enode = void 0;
      }
      node.value.value = value;
      this.disposer?.(val, key);
      return true;
    }
    this.ensure(size);
    assert(!this.memory.has(key));

    const { LRU } = this.indexes;
    assert(LRU.length !== this.capacity);
    this.SIZE += size;
    assert(0 < this.size && this.size <= this.space);
    this.memory.set(key, LRU.unshift({
      key,
      value,
      size,
      expiry,
      region: 'LRU',
    }));
    if (this.earlyExpiring && expiry !== Infinity) {
      LRU.head!.value.enode = this.expiries.insert(LRU.head!);
      assert(this.expiries.length <= this.length);
    }
    return false;
  }
  public set(key: K, value: V, opts?: { size?: number; age?: number; }): this;
  public set(this: Cache<K, undefined>, key: K, value?: V, opts?: { size?: number; age?: number; }): this;
  public set(key: K, value: V, opts?: { size?: number; age?: number; }): this {
    this.put(key, value, opts);
    return this;
  }
  public get(key: K): V | undefined {
    const node = this.memory.get(key);
    if (!node) return;
    const expiry = node.value.expiry;
    if (expiry !== Infinity && expiry < now()) {
      this.evict(node, true);
      return;
    }
    // Optimization for memoize.
    if (this.capacity > 3 && node === node.list.head) return node.value.value;
    this.access(node);
    this.slide();
    return node.value.value;
  }
  public has(key: K): boolean {
    //assert(this.memory.has(key) === (this.indexes.LFU.has(key) || this.indexes.LRU.has(key)));
    //assert(this.memory.size === this.indexes.LFU.length + this.indexes.LRU.length);
    const node = this.memory.get(key);
    if (!node) return false;
    const expiry = node.value.expiry;
    if (expiry !== Infinity && expiry < now()) {
      this.evict(node, true);
      return false;
    }
    return true;
  }
  public delete(key: K): boolean {
    const node = this.memory.get(key);
    if (!node) return false;
    this.evict(node, this.settings.capture!.delete === true);
    return true;
  }
  public clear(): void {
    this.overlap = 0;
    this.SIZE = 0;
    this.ratio = 500;
    this.stats.clear();
    this.indexes.LRU.clear();
    this.indexes.LFU.clear();
    this.expiries.clear();
    if (!this.disposer || !this.settings.capture!.clear) return void this.memory.clear();
    const memory = this.memory;
    this.memory = new Map();
    for (const [key, { value: { value } }] of memory) {
      this.disposer(value, key);
    }
  }
  public *[Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    for (const [key, { value: { value } }] of this.memory) {
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
  private ratio = 500;
  private readonly limit: number;
  private slide(): void {
    const { LRU, LFU } = this.stats;
    const { capacity, ratio, limit, indexes } = this;
    const window = capacity;
    const total = LRU[0] + LFU[0];
    total === window && this.stats.slide();
    if (total * 1000 % capacity || !LRU[1] || !LFU[1]) return;
    const lenR = indexes.LRU.length;
    const lenF = indexes.LFU.length;
    const lenO = this.overlap;
    const r = (lenF + lenO) * 1000 / (lenR + lenF || 1) | 0;
    const rateR0 = rate(window, LRU[0], LRU[0] + LFU[0], LRU[1], LRU[1] + LFU[1], 0) * r;
    const rateF0 = rate(window, LFU[0], LRU[0] + LFU[0], LFU[1], LRU[1] + LFU[1], 0) * (1000 - r);
    const rateF1 = rate(window, LFU[1], LRU[1] + LFU[1], LFU[0], LRU[0] + LFU[0], 5) * (1000 - r);
    // 操作頻度を超えてキャッシュ比率を増減させても余剰比率の消化が追いつかず無駄
    // LRUの下限設定ではLRU拡大の要否を迅速に判定できないためLFUのヒット率低下の検出で代替する
    if (ratio > 0 && (rateR0 > rateF0 || rateF0 < rateF1 * 0.95)) {
      if (lenR >= capacity * (1000 - ratio) / 1000) {
        //ratio % 100 || ratio === 1000 || console.debug('-', ratio, LRU, LFU);
        --this.ratio;
      }
    }
    else
    if (ratio < limit && rateF0 > rateR0) {
      if (lenF >= capacity * ratio / 1000) {
        //ratio % 100 || ratio === 0 || console.debug('+', ratio, LRU, LFU);
        ++this.ratio;
      }
    }
  }
  private access(node: List.Node<Index<K, V>>): boolean {
    return this.accessLFU(node)
        || this.accessLRU(node);
  }
  private accessLRU(node: List.Node<Index<K, V>>): boolean {
    assert(node.list === this.indexes.LRU);
    const index = node.value;
    ++this.stats[index.region][0];
    this.overlap -= +(index.region === 'LFU');
    assert(this.overlap >= 0);
    index.region = 'LFU';
    assert(this.indexes.LFU.length < this.capacity);
    this.indexes.LFU.unshiftNode(node);
    return true;
  }
  private accessLFU(node: List.Node<Index<K, V>>): boolean {
    if (node.list !== this.indexes.LFU) return false;
    const index = node.value;
    ++this.stats[index.region][0];
    node.moveToHead();
    return true;
  }
}

function rate(
  window: number,
  currHits: number,
  currTotal: number,
  prevHits: number,
  prevTotal: number,
  offset: number,
): number {
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
