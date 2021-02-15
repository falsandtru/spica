import { Map } from './global';
import { IterableCollection } from './collection';
import { extend } from './assign';
import { indexOf, splice } from './array';

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
      let key: K;
      if (LFU.length > this.capacity * this.ratio / 100 || LFU.length === this.capacity) {
        assert(LFU.length > 0);
        key = LFU.pop()!;
      }
      else {
        assert(LRU.length > 0);
        key = LRU.pop()!;
      }
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

    LRU.unshift(key);
    this.store.set(key, value);
    return false;
  }
  public set<W extends V>(this: Cache<K, undefined>, key: K, value?: W): this;
  public set<W extends V>(key: K, value: W): this;
  public set<W extends V>(key: K, value: W): this {
    this.put(key, value);
    return this;
  }
  public get(key: K): V | undefined {
    const val = this.store.get(key);
    if (val !== void 0 || this.nullish && this.has(key)) {
      assert(this.store.has(key));
      this.access(key);
    }
    else {
      assert(!this.store.has(key));
      ++this.stats.miss;
      this.slide();
    }
    return val;
  }
  public has(key: K): boolean {
    assert(this.store.has(key) === (this.indexes.LFU.includes(key) || this.indexes.LRU.includes(key)));
    assert(this.store.size === this.indexes.LFU.length + this.indexes.LRU.length);
    return this.store.has(key);
  }
  public delete(key: K): boolean {
    if (!this.has(key)) return false;
    const { LRU, LFU } = this.indexes;
    for (const index of [LFU, LRU]) {
      const i = indexOf(index, key);
      if (i === -1) continue;
      if (!this.settings.disposer || !this.settings.capture!.delete) {
        this.store.delete(splice(index, i, 1)[0]);
      }
      else {
        const val = this.store.get(key)!;
        this.store.delete(splice(index, i, 1)[0]);
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
      LRU: [],
      LFU: [],
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
    assert(this.indexes.LRU.length + this.indexes.LFU.length === this.store.size);
    return this.indexes.LRU.length + this.indexes.LFU.length;
  }
  public [Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    return this.store[Symbol.iterator]();
  }
  private store = new Map<K, V>();
  private indexes: {
    LRU: K[];
    LFU: K[];
  } = {
    LRU: [],
    LFU: [],
  };
  private stats: {
    LRU: [number, number];
    LFU: [number, number];
    miss: number;
  } = {
    LRU: [0, 0],
    LFU: [0, 0],
    miss: 0,
  };
  private ratio = 50;
  private slide(): void {
    const { LRU, LFU, miss } = this.stats;
    // 速度への影響を確認できなかったため毎回再計算
    //if ((LRU[0] + LFU[0]) % step) return;
    const capacity = this.capacity;
    const window = capacity;
    const rateR = rate(window, LRU[0], LRU[0] + LFU[0], LRU[1], LRU[1] + LFU[1]);
    const rateF = 100 - rateR;
    const ratio = this.ratio;
    const step = 1;
    // LFUに収束させる
    // 小さすぎるLRUのために非効率にならないようにする
    // なぜかLFUとLRUを広く往復させないとヒットレートが上がらない
    if (ratio < 90 && rateF > rateR * 1.2) {
      this.ratio += step;
    }
    // LRUに収束させない
    // LFUと半々で均等分布においてLRUのみと同等効率
    // これ以下に下げても(LRUを50%超にしても)均等分布ですら効率が悪化する
    else
    if (ratio > 50 && rateR > rateF * 1.2) {
      //console.log(this.ratio);
      this.ratio -= step;
    }
    // シーケンシャルおよび推移的アクセスパターンへの対処
    // 削除しても他のパターンに悪影響なし
    else
    if (ratio <= 50 && rateR > rateF * 1.5 && this.indexes.LRU.length > capacity / 100 * (100 - ratio) - 1) {
      // シーケンシャルアクセスからLFUを保護
      if (ratio > 10 && miss > capacity / 2) {
        this.ratio = 50;
      }
      // 推移的アクセスでLRUを拡大
      // 小さいキャッシュサイズで誤差が大きく不安定になりやすい
      else
      if (ratio > 10 && miss > 5 && this.indexes.LRU.length < miss * 5) {
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
    this.slide();
    return hit;
  }
  private accessLRU(key: K, stats?: Cache<K, V>['stats']): boolean {
    const { LRU, LFU } = this.indexes;
    const index = indexOf(LRU, key);
    assert(index > -1 === this.store.has(key));
    if (index === -1) return false;
    stats && ++stats.LRU[0];
    if (index === 0) return LFU.unshift(LRU.shift()!), true;
    // spliceが遅いので代用
    // 速度の倍化に対してヒットレートの低下はごくわずか
    //LRU.unshift(splice(LRU, index, 1)[0]);
    [LRU[index - 1], LRU[index]] = [LRU[index], LRU[index - 1]];
    return true;
  }
  private accessLFU(key: K, stats?: Cache<K, V>['stats']): boolean {
    const { LFU } = this.indexes;
    const index = indexOf(LFU, key);
    if (index === -1) return false;
    stats && ++stats.LFU[0];
    if (index === 0) return true;
    [LFU[index - 1], LFU[index]] = [LFU[index], LFU[index - 1]];
    return true;
  }
}

function rate(window: number, currHits: number, currTotal: number, prevHits: number, prevTotal: number): number {
  const currRate = currHits * 100 / currTotal | 0;
  const currRatio = currTotal / window;
  const prevRate = prevHits * 100 / prevTotal | 0;
  const prevRatio = 1 - currRatio;
  return currRate * currRatio + prevRate * prevRatio | 0;
}
