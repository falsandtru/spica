import { max, min, ceil, round } from './alias';
import { now } from './clock';
import { IterableDict } from './dict';
import { List } from './list';
import { Heap } from './heap';
import { extend } from './assign';

// Dual Window Cache

/*
LFU論理寿命：
小容量で小効果のみにつきLRU下限で代替し無効化。

LRU下限：
小容量で大効果につき採用。

LFUヒット率変化率：
S3での逆効果のみ確認につきオプション化。

統計解像度：
効果ないが検証用に残置。

サイクリックスィープ：
LRU汚染対策。
大効果につき採用。

履歴標本：
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
すでにARCに近いヒット率を達成しているため2倍のキーサイズとリスト操作による
空間効率と速度の低下を正当化できるワークロードでのみ優位性がある。
Loop耐性が欠如しておりGLIやDS1などLoop耐性を要するワークロードではDWCが大幅に優れている。

DWC:
時間空間ともに定数計算量かつすべての基本的耐性を持つ。
情報量(履歴)の不足を補うため全体的に統計精度への依存度が上がっており標本サイズが小さくなるほど
情報量(標本がシグナルとなる確率)と統計精度の低下により性能低下しやすくなる。

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
ブルームフィルタが削除操作不可であるため一定期間内のキャッシュの任意または有効期限超過による
削除数に比例して性能が低下する。
キャッシュサイズ分の挿入ごとにブルームフィルタがリセットのため全走査されるため
キャッシュサイズに比例した大きさの遅延が入る。
W-TinyLFUの性能は非常に高いがTinyLFUの性能は大幅に低くDWCと一長一短かより悪いうえ
バーストアクセスに脆弱となるためあらかじめワークロードが検証されている場合以外はDWCのほうが優れている。
メインキャッシュにLRUを使用しているためこれをDWCに置換できる可能性がある。

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

const RESOLUTION = 1000;

class Entry<K, V> implements List.Node {
  constructor(
    public key: K,
    public value: V,
    public size: number,
    public partition: List<Entry<K, V>>,
    public region: 'LRU' | 'LFU',
    public expiration: number,
  ) {
  }
  public enode?: Heap.Node<Entry<K, V>, number> = undefined;
  public next?: this = undefined;
  public prev?: this = undefined;
}

export namespace Cache {
  export interface Options<K, V = undefined> {
    // Max entries.
    // Range: 1-
    readonly capacity?: number;
    // Window ratio to measure hit ratios.
    // Range: 1-100
    readonly window?: number;
    // Max costs.
    // Range: L-
    readonly resource?: number;
    readonly age?: number;
    readonly eagerExpiration?: boolean;
    readonly disposer?: (value: V, key: K) => void;
    readonly capture?: {
      readonly delete?: boolean;
      readonly clear?: boolean;
    };
    // Mainly for experiments.
    // Min LRU ratio.
    // Range: 1-100
    readonly scope?: number;
    // Sample ratio of LRU in LFU.
    // Range: 0-100
    readonly sample?: number;
    readonly resolution?: number;
    readonly offset?: number;
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
    if (opts.test) {
      // @ts-expect-error
      this.settings.sweep!.threshold = 0;
    }
    const settings = extend(this.settings, opts, {
      capacity,
    });
    if (settings.window! >= 0.1 === false) throw new Error(`Spica: Cache: Window must be 0.1% or more of capacity.`);
    this.capacity = capacity = settings.capacity!;
    if (capacity >>> 0 !== capacity) throw new Error(`Spica: Cache: Capacity must be integer.`);
    if (capacity >= 1 === false) throw new Error(`Spica: Cache: Capacity must be 1 or more.`);
    this.window = settings.window! * capacity / 100 >>> 0;
    this.unit = capacity / RESOLUTION | 0 || 1;
    this.limit = capacity - (capacity * settings.scope! / 100 >>> 0);
    this.partition = this.limit;
    this.sample = settings.sample!;
    this.resource = settings.resource! ?? capacity;
    this.age = settings.age!;
    if (settings.eagerExpiration) {
      this.expirations = new Heap(Heap.min);
    }
    this.stats = opts.resolution || opts.offset
      ? new StatsExperimental(this.window, settings.resolution!, settings.offset!)
      : new Stats(this.window);
    this.sweeper = new Sweeper(
      this.LRU,
      settings.sweep!.threshold!,
      capacity,
      settings.sweep!.window!,
      settings.sweep!.range!,
      settings.sweep!.shift!);
    this.disposer = settings.disposer!;
    this.test = settings.test!;
    assert(settings.resource === opts.resource);
  }
  private readonly settings: Cache.Options<K, V> = {
    capacity: 0,
    window: 100,
    scope: 5,
    sample: 2,
    age: Infinity,
    eagerExpiration: false,
    capture: {
      delete: true,
      clear: true,
    },
    resolution: 1,
    offset: 0,
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
  private dict = new Map<K, Entry<K, V>>();
  private LRU = new List<Entry<K, V>>();
  private LFU = new List<Entry<K, V>>();
  private overlapLRU = 0;
  private overlapLFU = 0;
  private expiration = false;
  private readonly age: number;
  private readonly expirations?: Heap<Entry<K, V>, number>;
  public get length(): number {
    const { LRU, LFU } = this;
    return LRU.length + LFU.length;
  }
  private resource: number;
  private $size = 0;
  public get size(): number {
    return this.$size;
  }
  private readonly disposer?: (value: V, key: K) => void;
  private evict(entry: Entry<K, V>, callback: boolean): void {
    assert(this.LRU.length + this.LFU.length === this.dict.size);
    //assert(this.dict.size <= this.capacity);
    assert(entry.next);
    entry.partition === this.LRU
      ? entry.region === 'LFU' && --this.overlapLFU
      : entry.region === 'LRU' && --this.overlapLRU;
    assert(this.overlapLRU >= 0);
    assert(this.overlapLFU >= 0);
    if (entry.enode !== undefined) {
      this.expirations!.delete(entry.enode);
      entry.enode = undefined;
    }
    entry.partition.delete(entry);
    assert(this.LRU.length + this.LFU.length === this.dict.size - 1);
    this.dict.delete(entry.key);
    assert(this.LRU.length + this.LFU.length === this.dict.size);
    //assert(this.dict.size <= this.capacity);
    this.$size -= entry.size;
    callback && this.disposer?.(entry.value, entry.key);
  }
  private readonly sample: number;
  private overlap(entry: Entry<K, V>): Entry<K, V> {
    if (entry.partition === this.LRU) {
      if (entry.region === 'LRU') {
        ++this.overlapLRU;
        assert(this.overlapLRU - 1 <= this.LFU.length);
      }
      else {
        --this.overlapLFU;
        assert(this.overlapLFU >= 0);
      }
    }
    else {
      if (entry.region === 'LFU') {
        ++this.overlapLFU;
        assert(this.overlapLFU - 1 <= this.LRU.length);
      }
      else {
        --this.overlapLRU;
        assert(this.overlapLRU >= 0);
      }
    }
    return entry;
  }
  private readonly sweeper: Sweeper<List<Entry<K, V>>>;
  private acc = 0;
  private ensure(margin: number, skip?: Entry<K, V>, capture = false): Entry<K, V> | undefined {
    let size = skip?.size ?? 0;
    assert(margin - size <= this.resource || !capture);
    const { LRU, LFU } = this;
    while (this.size + margin - size > this.resource) {
      assert(this.length >= 1 + +!!skip);
      let victim = this.expirations?.peek();
      if (victim !== undefined && victim !== skip && victim.expiration < now()) {
      }
      else if (LRU.length === 0) {
        assert(LFU.head!.prev);
        victim = LFU.head!.prev!;
        victim = victim !== skip
          ? victim
          : victim.prev!;
      }
      else {
        assert(LRU.head!.prev);
        if (LFU.length > this.partition) {
          assert(LFU.head!.prev);
          let entry = LFU.head!.prev;
          entry = entry !== skip
            ? entry
            : LFU.length !== 1
              ? entry!.prev
              : undefined;
          if (entry !== undefined) {
            assert(entry !== skip);
            assert(entry.partition === LFU);
            LFU.delete(entry);
            LRU.unshift(this.overlap(entry));
            entry.partition = LRU;
          }
        }
        else if (LRU.length >= this.capacity - this.limit &&
                 this.overlapLRU * 100 / min(LFU.length, this.partition) < this.sample) {
          this.acc = min(this.acc + this.sample / 100, this.capacity);
          const entry = LRU.head!.prev!;
          if (this.acc >= 1 && entry.region === 'LRU') {
            LRU.delete(entry);
            LFU.unshift(this.overlap(entry));
            entry.partition = LFU;
            --this.acc;
          }
        }
        if (this.sweeper.isActive()) {
          this.sweeper.sweep();
        }
        if (LRU.length !== 0) {
          victim = LRU.head!.prev!;
          victim = victim !== skip
            ? victim
            : LRU.length !== 1
              ? victim.prev
              : undefined;
          assert(victim || skip === LRU.head!.prev);
          if (capture && skip === undefined && victim !== undefined) {
            assert(victim === LRU.head!.prev);
            skip = victim;
            size = skip.size;
            continue;
          }
          victim ??= LFU.head!.prev!;
        }
        else {
          assert(!skip || LFU.length >= 2);
          victim = LFU.head!.prev!;
          victim = victim !== skip
            ? victim
            : victim.prev!;
        }
      }
      assert(victim !== skip);
      assert(this.dict.has(victim.key));
      this.evict(victim, true);
      skip = skip?.next && skip;
      size = skip?.size ?? 0;
    }
    assert(!skip || skip.next);
    return skip;
  }
  public put(key: K, value: V, opts?: { size?: number; age?: number; }): boolean;
  public put(this: Cache<K, undefined>, key: K, value?: V, opts?: { size?: number; age?: number; }): boolean;
  public put(key: K, value: V, { size = 1, age = this.age }: { size?: number; age?: number; } = {}): boolean {
    if (size < 1 || this.resource < size || age <= 0) {
      this.disposer?.(value, key);
      return false;
    }

    const { LRU } = this;
    const expiration = age === Infinity
      ? Infinity
      : now() + age;
    if (!this.expiration && expiration !== Infinity) {
      this.expiration = true;
    }
    let entry = this.dict.get(key);
    const match = entry !== undefined;
    entry = this.ensure(size, entry, true);
    if (entry === undefined) {
      assert(!this.dict.has(key));
      assert(LRU.length !== this.capacity);
      this.$size += size;
      assert(0 < this.size && this.size <= this.resource);
      entry = new Entry(
        key,
        value,
        size,
        LRU,
        'LRU',
        expiration,
      );
      LRU.unshift(entry);
      this.dict.set(key, entry);
      assert(this.LRU.length + this.LFU.length === this.dict.size);
      assert(this.dict.size <= this.capacity);
      if (this.expiration && this.expirations !== undefined && expiration !== Infinity) {
        entry.enode = this.expirations.insert(entry, expiration);
        assert(this.expirations.length <= this.length);
      }
      return false;
    }

    assert(entry.next);
    const key$ = entry.key;
    const value$ = entry.value;
    if (!match) {
      assert(entry === LRU.head!.prev);
      entry.region === 'LFU' && --this.overlapLFU;
      assert(this.overlapLFU >= 0);
      this.dict.delete(key$);
      this.dict.set(key, entry);
      assert(this.LRU.length + this.LFU.length === this.dict.size);
      assert(this.dict.size <= this.capacity);
      entry.key = key;
      entry.region = 'LRU';
    }
    assert(this.dict.has(key));
    entry.value = value;
    this.$size += size - entry.size;
    assert(0 < this.size && this.size <= this.resource);
    entry.size = size;
    entry.expiration = expiration;
    if (this.expiration && this.expirations !== undefined && expiration !== Infinity) {
      entry.enode !== undefined
        ? this.expirations.update(entry.enode, expiration)
        : entry.enode = this.expirations.insert(entry, expiration);
      assert(this.expirations.length <= this.length);
    }
    else if (entry.enode !== undefined) {
      this.expirations!.delete(entry.enode);
      entry.enode = undefined;
    }
    entry.partition.delete(entry);
    entry.partition.unshift(entry);
    assert(this.LRU.length + this.LFU.length === this.dict.size);
    this.disposer?.(value$, key$);
    return match;
  }
  public set(key: K, value: V, opts?: { size?: number; age?: number; }): this;
  public set(this: Cache<K, undefined>, key: K, value?: V, opts?: { size?: number; age?: number; }): this;
  public set(key: K, value: V, opts?: { size?: number; age?: number; }): this {
    this.put(key, value, opts);
    return this;
  }
  public get(key: K): V | undefined {
    const entry = this.dict.get(key);
    if (entry === undefined) {
      this.sweeper.miss();
      return;
    }
    if (this.expiration && entry.expiration !== Infinity && entry.expiration < now()) {
      this.sweeper.miss();
      this.evict(entry, true);
      return;
    }
    this.update(entry);
    return entry.value;
  }
  public has(key: K): boolean {
    const entry = this.dict.get(key);
    if (entry === undefined) return false;
    if (this.expiration && entry.expiration !== Infinity && entry.expiration < now()) {
      this.evict(entry, true);
      return false;
    }
    return true;
  }
  public delete(key: K): boolean {
    const entry = this.dict.get(key);
    if (entry === undefined) return false;
    this.evict(entry, this.settings.capture!.delete === true);
    return true;
  }
  public clear(): void {
    const { LRU, LFU } = this;
    this.acc = 0;
    this.$size = 0;
    this.partition = this.limit;
    this.dict = new Map();
    this.LRU = new List();
    this.LFU = new List();
    this.densityR = 0;
    this.densityF = 0;
    this.overlapLRU = 0;
    this.overlapLFU = 0;
    this.expiration = false;
    this.expirations?.clear();
    this.stats.clear();
    this.sweeper.clear();
    this.sweeper.replace(this.LRU);
    if (!this.disposer || !this.settings.capture!.clear) return;
    for (const { key, value } of LRU) {
      this.disposer(value, key);
    }
    for (const { key, value } of LFU) {
      this.disposer(value, key);
    }
  }
  public *[Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    for (const { key, value } of this.LRU) {
      yield [key, value];
    }
    for (const { key, value } of this.LFU) {
      yield [key, value];
    }
    return;
  }
  public resize(capacity: number, resource?: number): void {
    if (capacity >>> 0 !== capacity) throw new Error(`Spica: Cache: Capacity must be integer.`);
    if (capacity >= 1 === false) throw new Error(`Spica: Cache: Capacity must be 1 or more.`);
    const window = this.settings.window! * capacity / 100 >>> 0;
    this.partition = this.partition / this.capacity * capacity >>> 0;
    this.capacity = capacity;
    this.window = window;
    this.unit = capacity / RESOLUTION | 0 || 1;
    this.limit = capacity - (capacity * this.settings.scope! / 100 >>> 0);
    this.resource = resource ?? this.settings.resource ?? capacity;
    this.stats.resize(window);
    this.sweeper.resize(capacity, this.settings.sweep!.window!, this.settings.sweep!.range!);
    this.ensure(0);
  }
  private update(entry: Entry<K, V>): void {
    const { LRU, LFU } = this;
    this.sweeper.hit();
    if (entry.partition === LRU) {
      // For memoize.
      if (entry === LRU.head && !this.test) return;
      if (entry.region === 'LRU') {
        this.stats.hitLRU();
        entry.region = 'LFU';
      }
      else {
        const delta = LFU.length < LRU.length
          ? LRU.length / LFU.length | 0
          : 1;
        assert(delta > 0);
        this.partition = min(this.partition + delta, this.limit);
        this.stats.hitLFU();
        --this.overlapLFU;
        assert(this.overlapLFU >= 0);
      }
      assert(this.LFU.length < this.capacity);
      LRU.delete(entry);
      LFU.unshift(entry);
      entry.partition = LFU;
    }
    else {
      // For memoize.
      if (entry === LFU.head && !this.test) return;
      if (entry.region === 'LFU') {
        this.stats.hitLFU();
      }
      else {
        const delta = LRU.length < LFU.length
          ? LFU.length / LRU.length | 0
          : 1;
        assert(delta > 0);
        this.partition = max(this.partition - delta, 0);
        this.stats.hitLRU();
        entry.region = 'LFU';
        --this.overlapLRU;
        assert(this.overlapLRU >= 0);
      }
      LFU.delete(entry);
      LFU.unshift(entry);
    }
    this.coordinate();
  }
  private readonly stats: Stats | StatsExperimental;
  private partition: number;
  private unit: number;
  private limit: number;
  protected densityR = 0;
  protected densityF = 0;
  private coordinate(): void {
    const { capacity, LRU, LFU, stats } = this;
    if (stats.subtotal() * RESOLUTION % capacity !== 0 || !stats.isReady()) return;
    const lenR = LRU.length;
    const lenF = LFU.length;
    const overlapR = this.overlapLRU;
    const overlapF = this.overlapLFU;
    const leverage = min((lenF - overlapR + overlapF) * 1000 / (lenR + lenF) | 0, 1000);
    const ratioR = stats.ratioLRU();
    const ratioF = 10000 - ratioR;
    const densityR = this.densityR = ratioR * leverage;
    const densityF = this.densityF = ratioF * (1000 - leverage);
    const densityFO = stats.offset && stats.ratioLFU(true) * (1000 - leverage);
    // 操作頻度を超えてキャッシュ比率を増減させても余剰比率の消化が追いつかず無駄
    // LRUの下限設定ではLRU拡大の要否を迅速に判定できないためLFUのヒット率低下の検出で代替する
    if (this.partition > 0 && (densityR > densityF || stats.offset !== 0 && densityF * 100 < densityFO * (100 - stats.offset))) {
      if (lenR >= this.capacity - this.partition) {
        const delta = ratioF > ratioR
          ? this.unit * ratioF / ratioR | 0
          : this.unit;
        assert(delta >= this.unit);
        this.partition = max(this.partition - delta, 0);
      }
    }
    else
    if (this.partition < this.limit && densityF > densityR) {
      if (lenF >= this.partition) {
        const delta = ratioR > ratioF
          ? this.unit * ratioR / ratioF | 0
          : this.unit;
        assert(delta >= this.unit);
        this.partition = min(this.partition + delta, this.limit);
      }
    }
  }
}

// Sliding Window
class Stats {
  public static ratio(
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
  public ratioLRU(offset = false): number {
    return Stats.ratio(
      this.window,
      [this.currLRUHits, this.prevLRUHits],
      [this.currLFUHits, this.prevLFUHits],
      +offset & 0);
  }
  public ratioLFU(offset = false): number {
    return Stats.ratio(
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
  public static override ratio(
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
      const r = window * subratio / subtotal;
      total += subtotal * r;
      hits += targets[i] * r;
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
  public override ratioLRU(offset = false): number {
    return StatsExperimental.ratio(this.window, this.LRU, this.LFU, +offset && this.offset);
  }
  public override ratioLFU(offset = false): number {
    return StatsExperimental.ratio(this.window, this.LFU, this.LRU, +offset && this.offset);
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

assert(Stats.ratio(10, [4, 0], [6, 0], 0) === 4000);
assert(Stats.ratio(10, [0, 4], [0, 6], 0) === 4000);
assert(Stats.ratio(10, [1, 4], [4, 6], 0) === 3000);
assert(Stats.ratio(10, [0, 4], [0, 6], 5) === 4000);
assert(Stats.ratio(10, [1, 2], [4, 8], 5) === 2000);
assert(Stats.ratio(10, [2, 2], [3, 8], 5) === 2900);
assert(StatsExperimental.ratio(10, [4, 0], [6, 0], 0) === 4000);
assert(StatsExperimental.ratio(10, [0, 4], [0, 6], 0) === 4000);
assert(StatsExperimental.ratio(10, [1, 4], [4, 6], 0) === 3000);
assert(StatsExperimental.ratio(10, [0, 4], [0, 6], 5) === 4000);
assert(StatsExperimental.ratio(10, [1, 2], [4, 8], 5) === 2000);
assert(StatsExperimental.ratio(10, [2, 2], [3, 8], 5) === 2900);

// Transitive Wide MRU with Cyclic Replacement
class Sweeper<T extends List<Entry<unknown, unknown>>> {
  constructor(
    private target: T,
    private readonly threshold: number,
    capacity: number,
    private window: number,
    private range: number,
    private readonly shift: number,
  ) {
    this.threshold *= 100;
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
    this.active = undefined;
    ++this.currHits + this.currMisses === this.window && this.slide();
    this.processing && !this.isActive() && this.reset();
  }
  public miss(): void {
    this.active = undefined;
    this.currHits + ++this.currMisses === this.window && this.slide();
  }
  private active?: boolean;
  public isActive(): boolean {
    if (this.prevHits === 0 && this.prevMisses === 0) return false;
    return this.active ??= this.ratio() < this.threshold;
  }
  private ratio(): number {
    return Stats.ratio(
      this.window,
      [this.currHits, this.prevHits],
      [this.currMisses, this.prevMisses],
      0);
  }
  private processing = false;
  private direction = true;
  private initial = true;
  private back = 0;
  private advance = 0;
  public sweep(): boolean {
    const { target } = this;
    let lap = false;
    if (target.length === 0) return lap;
    this.processing ||= true;
    if (this.direction) {
      if (this.back < 1) {
        this.back += this.range;
        lap = !this.initial && this.back >= 1;
      }
    }
    else {
      if (this.advance < 1) {
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
        target.head = target.head!.next!.next;
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
    return lap;
  }
  private reset(): void {
    if (!this.processing) return;
    this.processing = false;
    this.direction = true;
    this.initial = true;
    this.back = 0;
    this.advance = 0;
    assert(!this.active);
  }
  public clear(): void {
    this.active = undefined;
    this.processing = true;
    this.reset();
    assert(!this.processing);
    this.slide();
    this.slide();
    assert(!this.isActive());
  }
  public replace(target: T): void {
    this.target = target;
  }
  public resize(capacity: number, window: number, range: number): void {
    this.window = round(capacity * window / 100) || 1;
    this.range = capacity * range / 100;
    this.currHits + this.currMisses >= this.window && this.slide();
    this.active = undefined;
  }
}
