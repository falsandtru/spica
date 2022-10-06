import { Infinity, Map } from './global';
import { min, round, ceil } from './alias';
import { now } from './clock';
import { IterableDict } from './dict';
import { List } from './invlist';
import { Heap } from './heap';
import { extend } from './assign';

// Dual Window Cache

/*
LFU論理寿命：
小容量で小効果のみにつきLRU下限で代替し廃止。

LRU下限：
小容量で大効果につき採用。

LFUヒット率変化率：
S3での逆効果のみ確認につきオプション化。

統計解像度：
効果ないが検証用に残置。

サイクリックスウィープ：
大効果につき採用。

*/

/*
比較検討

LRU/CLOCK:
性能が低い。

CAR/CDW:
最悪計算量がO(n)であるため汎用的でない。
CLOCKで高速化されるLFU操作の時間占有率がプロファイル上低く高速化が見込めない。
CARの近似アルゴリズムとしては有効だが当該用途ではCLOCK-Proなどのほうが適していると思われる。

ARC:
キャッシュサイズの2倍のキーを保持する。
すでにARCに近いヒット率を達成しているためわずかなヒット率向上のために
2倍のキーサイズとリスト操作による空間効率悪化と速度低下を正当化できるワークロードでのみ優位性がある。

LIRS:
キャッシュサイズの3倍以上のキーを保持する。
LIRS論文全著者を共著者とするLIRS2論文筆頭著者の実装によると最大2500倍、事実上無制限。
にもかかわらずARCより安定して十分に性能が高いとは言えないうえ大幅に性能の劣るケースも散見される。
履歴に現実的な上限を与えた場合の実際の性能が不明でありまともな比較資料がない。
キーを無制限に走査するGC的処理があるためキャッシュサイズに比例して大きな遅延が入る可能性が上がり
遅延が許容できない水準に達する可能性がある。
まともなアルゴリズムではない。

TinyLFU:
TinyLFUはキーのポインタのアドレスでブルームフィルタを生成するためJavaScriptでは
文字列やオブジェクトなどからアドレスを取得または代替値を高速に割り当てる方法がなく汎用的に使用できない。
乱数を代用する方法は強引で低速だがリモートアクセスなど低速な処理では償却可能と思われる。
オーバーヘッドが大きくメモ化など同期処理に耐える速度を要件とする用途には適さないと思われる。
適切なアクセスパターンを想定しており偏ったまたは破壊的なアクセスパターンに対しては
ブルームフィルタやウインドウを追加したバリアントへのアルゴリズムの変更が必要となる。
キャッシュサイズの1-0.5倍の頻度で2-4倍のサイズのブルームフィルタがリセットのため全走査される。
エヴィクションポリシーにLRUを使用しているためこれをDWCに置換できる可能性がある。

https://github.com/ben-manes/caffeine/wiki/Efficiency

*/

/*
# lru-cacheの最適化分析

最適化前(@6)よりオブジェクト値において50-10%ほど高速化している。

## Map値の数値化

Mapは値が数値の場合setが2倍高速化される。
getは変わらないため読み取り主体の場合効果が低い。

## インデクスアクセス化

個別の状態を個別のオブジェクトのプロパティに持たせると最適化されていないプロパティアクセスにより
低速化するためすべての状態を状態別の配列に格納しインデクスアクセスに変換することで高速化している。
DWCはこの最適化を行っても状態数の多さに比例して増加したオーバーヘッドに相殺され効果を得られない。
状態をオブジェクトの代わりに配列に入れても最適化されずプロパティ・インデクスとも二段のアクセスは
最適化されないと思われる。

## TypedArray

インデクスアクセス化にTypedArrayを使うことで配列の書き込みが2倍高速化される。
これによりリスト操作が高速化されるがもともと高速なため全体的な寄与は小さいと思われる。

*/

interface Entry<K, V> {
  readonly key: K;
  value: V;
  size: number;
  expiry: number;
  eid: number;
  region: 'LRU' | 'LFU';
}

export namespace Cache {
  export interface Options<K, V = undefined> {
    readonly capacity?: number;
    readonly window?: number;
    readonly age?: number;
    readonly earlyExpiring?: boolean;
    readonly disposer?: (value: V, key: K) => void;
    readonly capture?: {
      readonly delete?: boolean;
      readonly clear?: boolean;
    };
    // Mainly for experiments.
    readonly resolution?: number;
    readonly offset?: number;
    readonly entrance?: number;
    readonly threshold?: number;
    readonly sweep?: number;
    readonly test?: boolean;
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
    const settings = extend(this.settings, opts, {
      capacity,
    });
    this.capacity = settings.capacity!;
    if (this.capacity >= 1 === false) throw new Error(`Spica: Cache: Capacity must be 1 or more.`);
    this.window = settings.window! * this.capacity / 100 >>> 0 || this.capacity;
    if (this.window * 1000 >= this.capacity === false) throw new Error(`Spica: Cache: Window must be 0.1% of capacity or more.`);
    this.threshold = settings.threshold!;
    this.limit = 1000 - settings.entrance! * 10;
    this.age = settings.age!;
    if (settings.earlyExpiring) {
      this.expiries = new Heap(Heap.min);
    }
    this.disposer = settings.disposer!;
    this.stats = opts.resolution || opts.offset
      ? new StatsExperimental(this.window, settings.resolution!, settings.offset!)
      : new Stats(this.window);
    this.test = settings.test!;
  }
  private readonly settings: Cache.Options<K, V> = {
    capacity: 0,
    window: 100,
    age: Infinity,
    earlyExpiring: false,
    capture: {
      delete: true,
      clear: true,
    },
    resolution: 1,
    offset: 0,
    entrance: 5,
    threshold: 20,
    sweep: 10,
    test: false,
  };
  private readonly test: boolean;
  private capacity: number;
  private window: number;
  private overlap = 0;
  private SIZE = 0;
  private memory = new Map<K, List.Node<Entry<K, V>>>();
  private readonly indexes = {
    LRU: new List<Entry<K, V>>(),
    LFU: new List<Entry<K, V>>(),
  } as const;
  private readonly age: number;
  private readonly expiries?: Heap<List.Node<Entry<K, V>>, number>;
  private readonly disposer?: (value: V, key: K) => void;
  public get length(): number {
    //assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size);
    return this.indexes.LRU.length + this.indexes.LFU.length;
  }
  public get size(): number {
    return this.SIZE;
  }
  private evict(node: List.Node<Entry<K, V>>, callback: boolean): void {
    assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size);
    const entry = node.value;
    callback &&= !!this.disposer;
    assert(node.list);
    this.overlap -= +(entry.region === 'LFU' && node.list === this.indexes.LRU);
    assert(this.overlap >= 0);
    if (entry.eid !== -1) {
      this.expiries!.delete(entry.eid);
      entry.eid = -1;
    }
    node.delete();
    assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size - 1);
    this.memory.delete(entry.key);
    assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size);
    this.SIZE -= entry.size;
    callback && this.disposer?.(node.value.value, entry.key);
  }
  private ensure(margin: number, skip?: List.Node<Entry<K, V>>): List.Node<Entry<K, V>> | undefined {
    let size = skip?.value.size ?? 0;
    assert(margin - size <= this.capacity);
    const { LRU, LFU } = this.indexes;
    while (this.size + margin - size > this.capacity) {
      assert(this.length >= 1 + +!!skip);
      let target = this.expiries?.peek();
      if (target && target !== skip && target.value.expiry < now()) {
      }
      else if (LRU.length === 0) {
        assert(LFU.last);
        target = LFU.last! !== skip
          ? LFU.last!
          : LFU.last!.prev;
      }
      else {
        assert(LRU.last);
        if (this.misses > LRU.length * this.threshold / 100) {
          this.sweep ||= round(LRU.length * this.settings.sweep! / 100) || 1;
          if (this.sweep > 0) {
            LRU.head = LRU.head!.next.next;
            --this.sweep;
            this.sweep ||= -round(LRU.length * this.settings.sweep! / 100) || -1;
          }
          else {
            ++this.sweep;
          }
        }
        else if (LFU.length > this.capacity * this.ratio / 1000) {
          assert(LFU.last);
          target = LFU.last! !== skip
            ? LFU.last!
            : LFU.length !== 1
              ? LFU.last!.prev
              : skip;
          if (target !== skip) {
            LRU.unshiftNode(target);
            ++this.overlap;
            assert(this.overlap <= LRU.length);
          }
        }
        target = LRU.last! !== skip
          ? LRU.last!
          : LRU.length !== 1
            ? LRU.last!.prev
            : LFU.last!;
      }
      assert(target !== skip);
      assert(this.memory.has(target.value.key));
      this.evict(target, true);
      skip = skip?.list && skip;
      size = skip?.value.size ?? 0;
    }
    assert(!skip || skip.list);
    return skip;
  }
  public put(key: K, value: V, opts?: { size?: number; age?: number; }): boolean;
  public put(this: Cache<K, undefined>, key: K, value?: V, opts?: { size?: number; age?: number; }): boolean;
  public put(key: K, value: V, { size = 1, age = this.age }: { size?: number; age?: number; } = {}): boolean {
    if (size < 1 || this.capacity < size || age <= 0) {
      this.disposer?.(value, key);
      return false;
    }

    const { LRU } = this.indexes;
    if (age === Infinity) {
      age = 0;
    }
    const expiry = age
      ? now() + age
      : Infinity;
    const node = this.ensure(size, this.memory.get(key));
    if (node) {
      assert(node.list);
      assert(this.memory.has(key));
      const val = node.value.value;
      const entry = node.value;
      this.SIZE += size - entry.size;
      assert(0 < this.size && this.size <= this.capacity);
      entry.size = size;
      entry.expiry = expiry;
      if (this.expiries && age) {
        entry.eid !== -1
          ? this.expiries.update(entry.eid, expiry)
          : entry.eid = this.expiries.insert(node, expiry);
        assert(this.expiries.length <= this.length);
      }
      else if (entry.eid !== -1) {
        this.expiries!.delete(entry.eid);
        entry.eid = -1;
      }
      node.value.value = value;
      this.disposer?.(val, key);
      return true;
    }
    assert(!this.memory.has(key));

    assert(LRU.length !== this.capacity);
    this.SIZE += size;
    assert(0 < this.size && this.size <= this.capacity);
    this.memory.set(key, LRU.unshift({
      key,
      value,
      size,
      expiry,
      eid: -1,
      region: 'LRU',
    }));
    assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size);
    if (this.expiries && age) {
      LRU.head!.value.eid = this.expiries.insert(LRU.head!, expiry);
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
    if (!node) {
      ++this.misses;
      return;
    }
    const expiry = node.value.expiry;
    if (expiry !== Infinity && expiry < now()) {
      ++this.misses;
      this.evict(node, true);
      return;
    }
    this.misses &&= 0;
    this.sweep &&= 0;
    // Optimization for memoize.
    if (!this.test && node === node.list.head) return node.value.value;
    this.access(node);
    this.adjust();
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
    this.misses = 0;
    this.sweep = 0;
    this.overlap = 0;
    this.SIZE = 0;
    this.ratio = 500;
    this.stats.clear();
    this.indexes.LRU.clear();
    this.indexes.LFU.clear();
    this.expiries?.clear();
    if (!this.disposer || !this.settings.capture!.clear) return void this.memory.clear();
    const memory = this.memory;
    this.memory = new Map();
    for (const { 0: key, 1: { value: { value } } } of memory) {
      this.disposer(value, key);
    }
  }
  public resize(capacity: number): void {
    if (this.capacity >= 1 === false) throw new Error(`Spica: Cache: Capacity must be 1 or more.`);
    this.capacity = capacity;
    this.window = this.settings.window! * this.capacity / 100 >>> 0 || this.capacity;
    if (this.window * 1000 >= this.capacity === false) throw new Error(`Spica: Cache: Window must be 0.1% of capacity or more.`);
    this.ensure(0);
  }
  public *[Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    for (const { 0: key, 1: { value: { value } } } of this.memory) {
      yield [key, value];
    }
    return;
  }
  private access(node: List.Node<Entry<K, V>>): boolean {
    return this.accessLFU(node)
        || this.accessLRU(node);
  }
  private accessLRU(node: List.Node<Entry<K, V>>): boolean {
    assert(node.list === this.indexes.LRU);
    const entry = node.value;
    ++this.stats[entry.region][0];
    this.overlap -= +(entry.region === 'LFU');
    assert(this.overlap >= 0);
    entry.region = 'LFU';
    assert(this.indexes.LFU.length < this.capacity);
    this.indexes.LFU.unshiftNode(node);
    return true;
  }
  private accessLFU(node: List.Node<Entry<K, V>>): boolean {
    if (node.list !== this.indexes.LFU) return false;
    const entry = node.value;
    ++this.stats[entry.region][0];
    node.moveToHead();
    return true;
  }
  private misses = 0;
  private threshold: number;
  private sweep = 0;
  private readonly stats: Stats | StatsExperimental;
  private ratio = 500;
  private readonly limit: number;
  private adjust(): void {
    const { capacity, ratio, limit, stats, indexes } = this;
    if (stats.subtotal() * 1000 % capacity || !stats.isFull()) return;
    assert(stats.LRU.length >= 2);
    const lenR = indexes.LRU.length;
    const lenF = indexes.LFU.length;
    const lenO = this.overlap;
    const leverage = (lenF + lenO) * 1000 / (lenR + lenF) | 0;
    const rateR = stats.rateLRU();
    const rateF = 10000 - rateR;
    const rateR0 = rateR * leverage;
    const rateF0 = rateF * (1000 - leverage);
    const rateF1 = stats.offset && stats.rateLFU(true) * (1000 - leverage);
    // 操作頻度を超えてキャッシュ比率を増減させても余剰比率の消化が追いつかず無駄
    // LRUの下限設定ではLRU拡大の要否を迅速に判定できないためLFUのヒット率低下の検出で代替する
    if (ratio > 0 && (rateR0 > rateF0 || stats.offset && rateF0 * 100 < rateF1 * (100 - stats.offset))) {
      //rateR0 <= rateF0 && rateF0 * 100 < rateF1 * (100 - stats.offset) && console.debug(0);
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
}

class Stats {
  public static rate(
    window: number,
    hits1: readonly number[],
    hits2: readonly number[],
    offset: number,
  ): number {
    assert(hits1.length === 2);
    assert(hits1.length === hits2.length);
    const currTotal = hits1[0] + hits2[0];
    const prevTotal = hits1[1] + hits2[1];
    const currHits = hits1[0];
    const prevHits = hits1[1];
    assert(currTotal <= window);
    const prevRate = prevHits * 100 / (prevTotal || 1);
    const currRatio = currTotal * 100 / window - offset;
    if (currRatio <= 0) return prevRate * 100 | 0;
    const currRate = currHits * 100 / (currTotal || 1);
    const prevRatio = 100 - currRatio;
    return currRate * currRatio + prevRate * prevRatio | 0;
  }
  constructor(
    protected readonly window: number,
  ) {
  }
  public readonly offset: number = 0;
  protected readonly max: number = 2;
  public LRU = [0];
  public LFU = [0];
  public get length(): number {
    return this.LRU.length;
  }
  public isFull(): boolean {
    return this.length === this.max;
  }
  public rateLRU(offset = false): number {
    return Stats.rate(this.window, this.LRU, this.LFU, +offset & 0);
  }
  public rateLFU(offset = false): number {
    return Stats.rate(this.window, this.LFU, this.LRU, +offset & 0);
  }
  public subtotal(): number {
    const { LRU, LFU, window } = this;
    const subtotal = LRU[0] + LFU[0];
    subtotal >= window && this.slide();
    return LRU[0] + LFU[0];
  }
  protected slide(): void {
    const { LRU, LFU, max } = this;
    if (LRU.length === max) {
      LRU.pop();
      LFU.pop();
    }
    LRU.unshift(0);
    LFU.unshift(0);
    assert(LRU.length === LFU.length);
  }
  public clear(): void {
    this.LRU = [0];
    this.LFU = [0];
  }
}

class StatsExperimental extends Stats {
  public static override rate(
    window: number,
    hits1: readonly number[],
    hits2: readonly number[],
    offset: number,
  ): number {
    assert(hits1.length >= 2);
    assert(hits1.length === hits2.length);
    let total = 0;
    let hits = 0;
    let ratio = 100;
    for (let len = hits1.length, i = 0; i < len; ++i) {
      const subtotal = hits1[i] + hits2[i];
      if (subtotal === 0) continue;
      offset = i + 1 === len ? 0 : offset;
      const subratio = min(subtotal * 100 / window, ratio) - offset;
      offset = offset && subratio < 0 ? -subratio : 0;
      if (subratio <= 0) continue;
      const rate = window * subratio / subtotal;
      total += subtotal * rate;
      hits += hits1[i] * rate;
      ratio -= subratio;
      if (ratio <= 0) break;
    }
    return hits * 10000 / total | 0;
  }
  constructor(
    window: number,
    public readonly resolution: number,
    public override readonly offset: number,
  ) {
    super(window);
  }
  protected override readonly max = ceil(this.resolution * (100 + this.offset) / 100) + 1;
  public override rateLRU(offset = false): number {
    return StatsExperimental.rate(this.window, this.LRU, this.LFU, +offset && this.offset);
  }
  public override rateLFU(offset = false): number {
    return StatsExperimental.rate(this.window, this.LFU, this.LRU, +offset && this.offset);
  }
  public override subtotal(): number {
    const { LRU, LFU, window, resolution, offset } = this;
    if (offset && LRU[0] + LFU[0] >= window * offset / 100) {
      if (this.length === 1) {
        this.slide();
      }
      else {
        LRU[1] += LRU[0];
        LFU[1] += LFU[0];
        LRU[0] = 0;
        LFU[0] = 0;
      }
    }
    const subtotal = LRU[offset && 1] + LFU[offset && 1] || 0;
    subtotal >= window / resolution && this.slide();
    return LRU[0] + LFU[0];
  }
}

assert(Stats.rate(10, [4, 0], [6, 0], 0) === 4000);
assert(Stats.rate(10, [0, 4], [0, 6], 0) === 4000);
assert(Stats.rate(10, [1, 4], [4, 6], 0) === 3000);
assert(Stats.rate(10, [0, 4], [0, 6], 5) === 4000);
assert(Stats.rate(10, [1, 2], [4, 8], 5) === 2000);
assert(Stats.rate(10, [2, 2], [3, 8], 5) === 2900);
assert(StatsExperimental.rate(10, [4, 0], [6, 0], 0) === 4000);
assert(StatsExperimental.rate(10, [0, 4], [0, 6], 0) === 4000);
assert(StatsExperimental.rate(10, [1, 4], [4, 6], 0) === 3000);
assert(StatsExperimental.rate(10, [0, 4], [0, 6], 5) === 4000);
assert(StatsExperimental.rate(10, [1, 2], [4, 8], 5) === 2000);
assert(StatsExperimental.rate(10, [2, 2], [3, 8], 5) === 2900);
