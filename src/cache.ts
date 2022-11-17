import { max, min, ceil, round } from './alias';
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

CAR/CDW(CLOCK+DWC)/CLOCK-Pro:
最悪計算量がO(n)であるため汎用的でない。
CLOCK-ProはCAR同様合計2倍の履歴を持つ。

ARC:
キャッシュサイズの2倍のキーを保持する。
すでにARCに近いヒット率を達成しているためわずかなヒット率向上のために
2倍のキーサイズとリスト操作による空間効率悪化と速度低下を正当化できるワークロードでのみ優位性がある。
Loop耐性が欠如しておりGLIやDS1などLoop耐性を要するワークロードではDWCが大幅に優れている。

DWC:
時間空間ともに定数計算量かつすべての基本的耐性を持つ。
それゆえ履歴が必要となる高参照間隔または耐性が逆効果となる刷新を要するアクセスパターンでは
原理的に性能低下を免れない。
適正サイズより大幅に小さいキャッシュサイズではおそらく統計精度の悪化により性能低下しやすい。

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
ブルームフィルタが削除操作不可であるためキャッシュを削除操作数に比例して性能が低下する。
キャッシュサイズ分の挿入ごとにブルームフィルタがリセットのため全走査されるため
キャッシュサイズに比例した大きさの遅延が入る。
W-TinyLFUの性能は非常に高いがTinyLFUの性能は大幅に低くDWCと一長一短かより悪いうえ
バーストアクセスに脆弱となるためあらかじめワークロードが検証されている場合以外はDWCのほうが優れている。
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
  key: K;
  value: V;
  size: number;
  expiration: number;
  enode?: Heap.Node<List.Node<Entry<K, V>>, number>;
  region: 'LRU' | 'LFU';
}

export namespace Cache {
  export interface Options<K, V = undefined> {
    // Max length.
    readonly capacity?: number;
    readonly window?: number;
    readonly resource?: number;
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
    readonly sweep?: {
      readonly threshold?: number;
      readonly window?: number;
      readonly range?: number;
      readonly shift?: number;
    };
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
    this.capacity = capacity = settings.capacity!;
    if (capacity >>> 0 !== capacity) throw new Error(`Spica: Cache: Capacity must be integer.`);
    if (capacity >= 1 === false) throw new Error(`Spica: Cache: Capacity must be 1 or more.`);
    this.window = settings.window! * capacity / 100 >>> 0;
    if (this.window * 1000 >= capacity === false) throw new Error(`Spica: Cache: Window must be 0.1% or more of capacity.`);
    this.unit = 1000 / capacity | 0 || 1;
    this.limit = 1000 - settings.entrance! * 10;
    this.resource = settings.resource! ?? capacity;
    this.age = settings.age!;
    if (settings.earlyExpiring) {
      this.expirations = new Heap(Heap.min);
    }
    this.stats = opts.resolution || opts.offset
      ? new StatsExperimental(this.window, settings.resolution!, settings.offset!)
      : new Stats(this.window);
    this.sweeper = new Sweeper(
      this.indexes.LRU,
      settings.sweep!.threshold!,
      capacity,
      settings.sweep!.window!,
      settings.sweep!.range!,
      settings.sweep!.shift!);
    this.disposer = settings.disposer!;
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
    sweep: {
      threshold: 10,
      window: 5,
      range: 4,
      shift: 2,
    },
    test: false,
  };
  private readonly test: boolean;
  private capacity: number;
  private window: number;
  private memory = new Map<K, List.Node<Entry<K, V>>>();
  private readonly indexes = {
    LRU: new List<Entry<K, V>>(),
    LFU: new List<Entry<K, V>>(),
  } as const;
  private overlap = 0;
  private expiration = false;
  private readonly age: number;
  private readonly expirations?: Heap<List.Node<Entry<K, V>>, number>;
  public get length(): number {
    const { LRU, LFU } = this.indexes;
    return LRU.length + LFU.length;
  }
  private resource: number;
  private $size = 0;
  public get size(): number {
    return this.$size;
  }
  private readonly disposer?: (value: V, key: K) => void;
  private evict(node: List.Node<Entry<K, V>>, callback: boolean): void {
    assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size);
    //assert(this.memory.size <= this.capacity);
    const entry = node.value;
    assert(node.list);
    entry.region === 'LFU' && node.list === this.indexes.LRU && --this.overlap;
    assert(this.overlap >= 0);
    if (entry.enode !== undefined) {
      this.expirations!.delete(entry.enode);
      entry.enode = undefined;
    }
    node.delete();
    assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size - 1);
    this.memory.delete(entry.key);
    assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size);
    //assert(this.memory.size <= this.capacity);
    this.$size -= entry.size;
    callback && this.disposer?.(node.value.value, entry.key);
  }
  private sweeper: Sweeper;
  private ensure(margin: number, skip?: List.Node<Entry<K, V>>, capture = false): List.Node<Entry<K, V>> | undefined {
    let size = skip?.value.size ?? 0;
    assert(margin - size <= this.resource || !capture);
    const { LRU, LFU } = this.indexes;
    while (this.size + margin - size > this.resource) {
      assert(this.length >= 1 + +!!skip);
      let victim = this.expirations?.peek();
      if (victim !== undefined && victim !== skip && victim.value.expiration < now()) {
      }
      else if (LRU.length === 0) {
        assert(LFU.last);
        victim = LFU.last! !== skip
          ? LFU.last!
          : LFU.last!.prev;
      }
      else {
        assert(LRU.last);
        if (this.sweeper.isAvailable() && !this.test) {
          this.sweeper.sweep();
        }
        else if (LFU.length > this.capacity * (this.ratio ?? this.limit) / 1000) {
          assert(LFU.last);
          const node = LFU.last! !== skip
            ? LFU.last!
            : LFU.length !== 1
              ? LFU.last!.prev
              : undefined;
          if (node !== undefined) {
            assert(node !== skip);
            assert(node.value.region === 'LFU');
            LRU.unshiftNode(node);
            ++this.overlap;
            assert(this.overlap <= LRU.length);
          }
        }
        victim = LRU.last! !== skip
          ? LRU.last!
          : LRU.length !== 1
            ? LRU.last!.prev
            : undefined;
        if (capture && skip === undefined && victim !== undefined) {
          assert(victim === LRU.last);
          skip = victim;
          size = skip.value.size;
          continue;
        }
        victim ??= LFU.last!;
      }
      assert(victim !== skip);
      assert(this.memory.has(victim.value.key));
      this.evict(victim, true);
      skip = skip?.list && skip;
      size = skip?.value.size ?? 0;
    }
    assert(!skip || skip.list);
    return skip;
  }
  public put(key: K, value: V, opts?: { size?: number; age?: number; }): boolean;
  public put(this: Cache<K, undefined>, key: K, value?: V, opts?: { size?: number; age?: number; }): boolean;
  public put(key: K, value: V, { size = 1, age = this.age }: { size?: number; age?: number; } = {}): boolean {
    if (size < 1 || this.resource < size || age <= 0) {
      this.disposer?.(value, key);
      return false;
    }

    const { LRU } = this.indexes;
    age === Infinity
      ? age = 0
      : this.expiration ||= true;
    const expiration = age
      ? now() + age
      : Infinity;
    let node = this.memory.get(key);
    const match = node !== undefined;
    !match && this.sweeper.miss();
    node = this.ensure(size, node, true);
    if (node !== undefined) {
      assert(node.list);
      const entry = node.value;
      const key$ = entry.key;
      const value$ = entry.value;
      if (!match) {
        assert(node === LRU.last);
        entry.region === 'LFU' && --this.overlap;
        assert(this.overlap >= 0);
        this.memory.delete(key$);
        this.memory.set(key, node);
        entry.key = key;
        entry.region = 'LRU';
      }
      assert(this.memory.has(key));
      entry.value = value;
      this.$size += size - entry.size;
      assert(0 < this.size && this.size <= this.resource);
      entry.size = size;
      entry.expiration = expiration;
      if (this.expirations && age) {
        entry.enode !== undefined
          ? this.expirations.update(entry.enode, expiration)
          : entry.enode = this.expirations.insert(node, expiration);
        assert(this.expirations.length <= this.length);
      }
      else if (entry.enode !== undefined) {
        this.expirations!.delete(entry.enode);
        entry.enode = undefined;
      }
      node.moveToHead();
      this.disposer?.(value$, key$);
      return match;
    }
    assert(!this.memory.has(key));

    assert(LRU.length !== this.capacity);
    this.$size += size;
    assert(0 < this.size && this.size <= this.resource);
    this.memory.set(key, LRU.unshift({
      key,
      value,
      size,
      expiration,
      region: 'LRU',
    }));
    assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size);
    assert(this.memory.size <= this.capacity);
    if (this.expirations && age) {
      LRU.head!.value.enode = this.expirations.insert(LRU.head!, expiration);
      assert(this.expirations.length <= this.length);
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
    if (node === undefined) return;
    const entry = node.value;
    if (this.expiration && entry.expiration !== Infinity && entry.expiration < now()) {
      this.evict(node, true);
      return;
    }
    this.update(node);
    return entry.value;
  }
  public has(key: K): boolean {
    const node = this.memory.get(key);
    if (node === undefined) return false;
    const entry = node.value;
    if (this.expiration && entry.expiration !== Infinity && entry.expiration < now()) {
      this.evict(node, true);
      return false;
    }
    return true;
  }
  public delete(key: K): boolean {
    const node = this.memory.get(key);
    if (node === undefined) return false;
    this.evict(node, this.settings.capture!.delete === true);
    return true;
  }
  public clear(): void {
    this.$size = 0;
    this.ratio = undefined;
    this.indexes.LRU.clear();
    this.indexes.LFU.clear();
    this.overlap = 0;
    this.expiration = false;
    this.expirations?.clear();
    this.stats.clear();
    this.sweeper.clear();
    if (!this.disposer || !this.settings.capture!.clear) return void this.memory.clear();
    const memory = this.memory;
    this.memory = new Map();
    for (const { 0: key, 1: { value: { value } } } of memory) {
      this.disposer(value, key);
    }
  }
  public resize(capacity: number, resource: number = capacity): void {
    if (capacity >>> 0 !== capacity) throw new Error(`Spica: Cache: Capacity must be integer.`);
    if (capacity >= 1 === false) throw new Error(`Spica: Cache: Capacity must be 1 or more.`);
    const window = this.settings.window! * capacity / 100 >>> 0;
    if (window * 1000 >= capacity === false) throw new Error(`Spica: Cache: Window must be 0.1% or more of capacity.`);
    this.capacity = capacity;
    this.window = window;
    this.unit = 1000 / capacity | 0 || 1;
    this.resource = resource;
    this.stats.resize(window);
    this.sweeper.resize(capacity, this.settings.sweep!.window!, this.settings.sweep!.range!);
    this.ensure(0);
  }
  public *[Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    for (const { 0: key, 1: { value: { value } } } of this.memory) {
      yield [key, value];
    }
    return;
  }
  private update(node: List.Node<Entry<K, V>>): void {
    const entry = node.value;
    const { region } = entry;
    const { LRU, LFU } = this.indexes;
    this.sweeper.hit();
    if (node.list === LRU) {
      // For memoize.
      if (node === LRU.head && !this.test) return;
      if (region === 'LFU') {
        this.stats.hitLFU();
        --this.overlap;
        assert(this.overlap >= 0);
      }
      else {
        this.stats.hitLRU();
        entry.region = 'LFU';
      }
      assert(this.indexes.LFU.length < this.capacity);
      LFU.unshiftNode(node);
    }
    else {
      // For memoize.
      if (node === LFU.head && !this.test) return;
      this.stats.hitLFU();
      node.moveToHead();
    }
    this.coordinate();
  }
  private readonly stats: Stats | StatsExperimental;
  private ratio?: number;
  private unit: number;
  private readonly limit: number;
  private coordinate(): void {
    const { capacity, stats, indexes } = this;
    if (stats.subtotal() * 1000 % capacity !== 0 || !stats.isReady()) return;
    this.ratio ??= min(indexes.LFU.length / capacity * 1000 | 0, this.limit);
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
    if (this.ratio > 0 && (rateR0 > rateF0 || stats.offset && rateF0 * 100 < rateF1 * (100 - stats.offset))) {
      //rateR0 <= rateF0 && rateF0 * 100 < rateF1 * (100 - stats.offset) && console.debug(0);
      if (lenR >= capacity * (1000 - this.ratio) / 1000) {
        //this.ratio % 100 || this.ratio === 1000 || console.debug('-', this.ratio, LRU, LFU);
        this.ratio = max(this.ratio - this.unit, 0);
      }
    }
    else
    if (this.ratio < this.limit && rateF0 > rateR0) {
      if (lenF >= capacity * this.ratio / 1000) {
        //this.ratio % 100 || this.ratio === 0 || console.debug('+', this.ratio, LRU, LFU);
        this.ratio = min(this.ratio + this.unit, this.limit);
      }
    }
  }
}

// Sliding Window
class Stats {
  public static rate(
    window: number,
    targets: readonly [number, number],
    remains: readonly [number, number],
    offset: number,
  ): number {
    assert(targets.length === 2);
    assert(targets.length === remains.length);
    const currHits = targets[0];
    const prevHits = targets[1];
    const currTotal = currHits + remains[0];
    const prevTotal = prevHits + remains[1];
    assert(currTotal <= window);
    const prevRate = prevHits && prevHits * 100 / prevTotal;
    const currRatio = currTotal * 100 / window - offset;
    if (currRatio <= 0) return prevRate * 100 | 0;
    const currRate = currHits && currHits * 100 / currTotal;
    const prevRatio = 100 - currRatio;
    return currRate * currRatio + prevRate * prevRatio | 0;
  }
  constructor(
    protected window: number,
  ) {
  }
  public readonly offset: number = 0;
  private currLRUHits = 0;
  private prevLRUHits = 0;
  private currLFUHits = 0;
  private prevLFUHits = 0;
  public isReady(): boolean {
    return this.prevLRUHits !== 0
        || this.prevLFUHits !== 0;
  }
  public hitLRU(): void {
    ++this.currLRUHits + this.currLFUHits === this.window && this.slide();
  }
  public hitLFU(): void {
    this.currLRUHits + ++this.currLFUHits === this.window && this.slide();
  }
  public rateLRU(offset = false): number {
    return Stats.rate(
      this.window,
      [this.currLRUHits, this.prevLRUHits],
      [this.currLFUHits, this.prevLFUHits],
      +offset & 0);
  }
  public rateLFU(offset = false): number {
    return Stats.rate(
      this.window,
      [this.currLFUHits, this.prevLFUHits],
      [this.currLRUHits, this.prevLRUHits],
      +offset & 0);
  }
  public subtotal(): number {
    return this.currLRUHits + this.currLFUHits;
  }
  protected slide(): void {
    this.prevLRUHits = this.currLRUHits;
    this.prevLFUHits = this.currLFUHits;
    this.currLRUHits = 0;
    this.currLFUHits = 0;
  }
  public clear(): void {
    this.currLRUHits = 0;
    this.currLFUHits = 0;
    this.prevLRUHits = 0;
    this.prevLFUHits = 0;
  }
  public resize(window: number): void {
    this.window = window;
    this.currLRUHits + this.currLFUHits >= this.window && this.slide();
  }
}

class StatsExperimental extends Stats {
  public static override rate(
    window: number,
    targets: readonly number[],
    remains: readonly number[],
    offset: number,
  ): number {
    assert(targets.length >= 2);
    assert(targets.length === remains.length);
    let total = 0;
    let hits = 0;
    let ratio = 100;
    for (let len = targets.length, i = 0; i < len; ++i) {
      const subtotal = targets[i] + remains[i];
      if (subtotal === 0) continue;
      offset = i + 1 === len ? 0 : offset;
      const subratio = min(subtotal * 100 / window, ratio) - offset;
      offset = offset && subratio < 0 ? -subratio : 0;
      if (subratio <= 0) continue;
      const rate = window * subratio / subtotal;
      total += subtotal * rate;
      hits += targets[i] * rate;
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
  private readonly max = ceil(this.resolution * (100 + this.offset) / 100) + 1;
  private LRU = [0];
  private LFU = [0];
  public get length(): number {
    return this.LRU.length;
  }
  public override isReady(): boolean {
    return this.length === this.max;
  }
  public override hitLRU(): void {
    const { LRU, LFU, window, resolution, offset } = this;
    ++LRU[0];
    const subtotal = LRU[offset && 1] + LFU[offset && 1] || 0;
    subtotal >= window / resolution && this.slide();
  }
  public override hitLFU(): void {
    const { LRU, LFU, window, resolution, offset } = this;
    ++LFU[0];
    const subtotal = LRU[offset && 1] + LFU[offset && 1] || 0;
    subtotal >= window / resolution && this.slide();
  }
  public override rateLRU(offset = false): number {
    return StatsExperimental.rate(this.window, this.LRU, this.LFU, +offset && this.offset);
  }
  public override rateLFU(offset = false): number {
    return StatsExperimental.rate(this.window, this.LFU, this.LRU, +offset && this.offset);
  }
  public override subtotal(): number {
    const { LRU, LFU, window, offset } = this;
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
    return LRU[0] + LFU[0];
  }
  protected override slide(): void {
    const { LRU, LFU, max } = this;
    if (LRU.length === max) {
      LRU.pop();
      LFU.pop();
    }
    LRU.unshift(0);
    LFU.unshift(0);
    assert(LRU.length === LFU.length);
  }
  public override clear(): void {
    this.LRU = [0];
    this.LFU = [0];
  }
  public override resize(window: number): void {
    this.window = window;
    const { LRU, LFU, resolution, offset } = this;
    const subtotal = LRU[offset && 1] + LFU[offset && 1] || 0;
    subtotal >= window / resolution && this.slide();
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

// Transitive Wide MRU with Cyclic Replacement
class Sweeper {
  constructor(
    private readonly target: List<unknown>,
    private readonly threshold: number,
    capacity: number,
    private window: number,
    private range: number,
    private readonly shift: number,
  ) {
    this.window = round(capacity * window / 100) || 1;
    this.range = capacity * range / 100;
  }
  private currHits = 0;
  private currMisses = 0;
  private prevHits = 0;
  private prevMisses = 0;
  private slide(): void {
    this.prevHits = this.currHits;
    this.prevMisses = this.currMisses;
    this.currHits = 0;
    this.currMisses = 0;
  }
  public hit(): void {
    ++this.currHits + this.currMisses === this.window && this.slide();
    this.active && !this.isAvailable() && this.reset();
  }
  public miss(): void {
    this.currHits + ++this.currMisses === this.window && this.slide();
  }
  public isAvailable(): boolean {
    const rate = Stats.rate(
      this.window,
      [this.currHits, this.prevHits],
      [this.currMisses, this.prevMisses],
      0);
    return rate < this.threshold * 100;
  }
  private active = false;
  private direction = true;
  private initial = true;
  private back = 0;
  private advance = 0;
  public sweep(): void {
    this.active ||= true;
    const { target } = this;
    if (this.direction) {
      if (this.back < 1) {
        this.back += this.range;
      }
    }
    else {
      if (this.advance < 1) {
        assert(!this.initial);
        this.advance += this.range * (100 - this.shift) / 100;
      }
    }
    assert(this.back > 0 || this.advance > 0);
    if (this.back >= 1) {
      assert(this.direction === true);
      if (--this.back < 1) {
        this.direction = false;
      }
      if (this.initial) {
        this.initial = false;
        target.head = target.head!.next;
      }
      else {
        target.head = target.head!.next.next;
      }
    }
    else if (this.advance >= 1) {
      assert(this.direction === false);
      assert(!this.initial);
      if (--this.advance < 1) {
        this.direction = true;
      }
    }
    else {
      this.direction = !this.direction;
      target.head = target.head!.next;
    }
  }
  private reset(): void {
    if (!this.active) return;
    this.active = false;
    this.direction = true;
    this.initial = true;
    this.back = 0;
    this.advance = 0;
  }
  public clear(): void {
    this.active = true;
    this.reset();
    this.slide();
    this.slide();
  }
  public resize(capacity: number, window: number, range: number): void {
    this.window = round(capacity * window / 100) || 1;
    this.range = capacity * range / 100;
    this.currHits + this.currMisses >= this.window && this.slide();
  }
}
