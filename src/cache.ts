import { Map } from './global';
import { min } from './alias';
import { IterableCollection } from './collection';
import { extend } from './assign';
import { OList } from './olist';
import { tuple } from './tuple';

// Dual Window Cache

export interface CacheOptions<K, V = undefined> {
  readonly disposer?: (key: K, value: V) => void;
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
    if (capacity > 0 === false) throw new Error(`Spica: Cache: Cache capacity must be greater than 0.`);
    extend(this.settings, opts);
  }
  private readonly settings: CacheOptions<K, V> = {
    capture: {
      delete: true,
      clear: true,
    },
  };
  private nullish = false;
  public put(this: Cache<K, undefined>, key: K, value?: V): boolean;
  public put(key: K, value: V): boolean;
  public put(key: K, value: V): boolean {
    value === void 0
      ? this.nullish ||= true
      : void 0;
    if (this.has(key)) return this.store.set(key, value), true;

    const { LRU, LFU } = this.indexes;

    if (this.size === this.capacity) {
      const key = LFU.length === this.capacity || LFU.length > this.capacity * this.ratio / 100
        ? LFU.pop()!.key
        : LRU.pop()!.key;
      assert(this.store.has(key));
      if (this.settings.disposer) {
        const val = this.store.get(key)!;
        this.store.delete(key);
        this.settings.disposer(key, val);
      }
      else {
        this.store.delete(key);
      }
    }

    LRU.add(key);
    this.store.set(key, value);
    return false;
  }
  public set(this: Cache<K, undefined>, key: K, value?: V): this;
  public set(key: K, value: V): this;
  public set(key: K, value: V): this {
    this.put(key, value);
    return this;
  }
  public get(key: K): V | undefined {
    const val = this.store.get(key);
    if (val !== void 0 || this.nullish && this.has(key)) {
      assert(this.store.has(key));
      this.access(key);
      this.slide();
    }
    else {
      assert(!this.store.has(key));
      ++this.stats.miss;
      this.slide();
    }
    return val;
  }
  public has(key: K): boolean {
    //assert(this.store.has(key) === (this.indexes.LFU.has(key) || this.indexes.LRU.has(key)));
    //assert(this.store.size === this.indexes.LFU.length + this.indexes.LRU.length);
    return this.store.has(key);
  }
  public delete(key: K): boolean {
    if (!this.has(key)) return false;
    const { LRU, LFU } = this.indexes;
    for (const index of [LFU, LRU]) {
      const i = index.findIndex(key) ?? -1;
      if (i === -1) continue;
      index.delete(key);
      if (!this.settings.disposer || !this.settings.capture!.delete) {
        this.store.delete(key);
      }
      else {
        const val = this.store.get(key)!;
        this.store.delete(key);
        this.settings.disposer(key, val);
      }
      return true;
    }
    return false;
  }
  public clear(): void {
    this.nullish = false;
    this.ratio = 50;
    this.indexes = {
      LRU: new OList(this.capacity),
      LFU: new OList(this.capacity),
    };
    this.stats = {
      LRU: [0, 0],
      LFU: [0, 0],
      miss: 0,
    };
    const store = this.store;
    this.store = new Map();
    if (!this.settings.disposer || !this.settings.capture?.clear) return;
    for (const [key, value] of store) {
      this.settings.disposer(key, value);
    }
  }
  public get size(): number {
    //assert(this.indexes.LRU.length + this.indexes.LFU.length === this.store.size);
    return this.indexes.LRU.length + this.indexes.LFU.length;
  }
  public [Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    return this.store[Symbol.iterator]();
  }
  private store = new Map<K, V>();
  private indexes = {
    LRU: new OList<K>(this.capacity),
    LFU: new OList<K>(this.capacity),
  } as const;
  private stats = {
    LRU: tuple(0, 0),
    LFU: tuple(0, 0),
    miss: 0,
  };
  private ratio = 50;
  private slide(): void {
    const { LRU, LFU, miss } = this.stats;
    // 速度への影響を確認できなかったため毎回再計算
    //if ((LRU[0] + LFU[0]) % step) return;
    const capacity = this.capacity;
    // シーケンシャルアクセス等の早期検出のため半分にしてみる
    const window = (capacity + 1) / 2 | 0;
    const rateR = rate(window, LRU[0], LRU[0] + LFU[0], LRU[1], LRU[1] + LFU[1]);
    const rateF = 100 - rateR;
    const ratio = this.ratio;
    const step = 1;
    // LFUに収束させる
    // なぜかLFUとLRUを広く往復させないとヒット率が上がらない
    if (ratio < 100 && rateF > rateR * 1.1) {
      this.ratio += step;
    }
    // LRUに収束させない
    // LFUと半々で均等分布においてLRUのみと同等効率
    // これ以下に下げても(LRUを50%超にしても)均等分布ですら効率が悪化する
    else
    if (ratio > 50 && rateR > rateF * 1.1) {
      //console.log(this.ratio);
      this.ratio -= step;
    }
    // シーケンシャルおよび推移的アクセスパターンへの対処
    // 削除しても他のパターンに悪影響なし
    else
    if (ratio <= 50 && rateR > rateF * 10 && this.indexes.LRU.length >= capacity * (100 - ratio) / 100) {
      // シーケンシャルアクセスでLRUを縮小しLFUを保護
      // TODO: 異なるアクセスパターンの混在によりキャッシュミスの連続性からシーケンシャルアクセスを検出できない場合の対処
      // 保護したいLFU容量の残余となるLRU容量分の区間のLRUのヒット率が低すぎる場合LRU容量を制限してもこれによるヒット率の低下は
      // 実数の小ささから無視できると思われる
      if (miss * 3 > capacity) {
        this.ratio = 50;
      }
      // 推移的アクセスでLRUを拡大
      else
      if (ratio > 10 && miss * 20 > this.indexes.LRU.length) {
        this.ratio -= step;
      }
      // 自力でLFUを回復できないので補助
      else
      if (ratio < 50) {
        this.ratio += step;
      }
    }
    assert(LRU[0] + LFU[0] <= window);
    assert(LRU[1] + LFU[1] <= window);
    if (LRU[0] + LFU[0] === window) {
      this.stats = {
        LRU: [0, LRU[0]],
        LFU: [0, LFU[0]],
        miss,
      };
    }
  }
  private access(key: K): boolean {
    const stats = this.stats;
    const hit = false
      || this.accessLFU(key, stats)
      || this.accessLRU(key, stats);
    assert(hit === this.store.has(key));
    assert(hit);
    stats.miss = 0;
    return hit;
  }
  private accessLRU(key: K, stats: Cache<K, V>['stats']): boolean {
    const { LRU, LFU } = this.indexes;
    const index = LRU.findIndex(key) ?? -1;
    assert(index > -1 === this.store.has(key));
    if (index === -1) return false;
    ++stats.LRU[0];
    if (index === LRU.peek()!.index) return LFU.add(LRU.shift()!.key), true;
    LRU.raiseToTop(index);
    return true;
  }
  private accessLFU(key: K, stats: Cache<K, V>['stats']): boolean {
    const { LFU } = this.indexes;
    const index = LFU.findIndex(key) ?? -1;
    if (index === -1) return false;
    ++stats.LFU[0];
    if (index === LFU.peek()!.index) return true;
    LFU.raiseToTop(index);
    return true;
  }
}

function rate(window: number, currHits: number, currTotal: number, prevHits: number, prevTotal: number): number {
  window = min(currTotal + prevTotal, window);
  const currRate = currHits * 100 / currTotal;
  const currRatio = currTotal / window;
  const prevRate = prevHits * 100 / prevTotal;
  const prevRatio = 1 - currRatio;
  return currRate * currRatio + prevRate * prevRatio | 0;
}
