import type { DeepRequired } from './type';
import { undefined, Map } from './global';
import { IterableCollection } from './collection';
import { extend } from './assign';
import { indexOf, splice } from './array';
import { noop } from './noop';

export interface CacheOptions<K, V = undefined> {
  readonly ignore?: {
    readonly delete?: boolean;
    readonly clear?: boolean;
  };
  readonly data?: {
    readonly indexes: readonly [readonly K[], readonly K[]];
    readonly entries: readonly (readonly [K, V])[];
  };
  readonly callback?: (key: K, value: V) => void;
  readonly mode?: 'auto' | 'DW' | 'LRU';
}

export class Cache<K, V = undefined> implements IterableCollection<K, V> {
  constructor(
    private readonly capacity: number,
    opts: CacheOptions<K, V> = {},
  ) {
    if (capacity > 0 === false) throw new Error(`Spica: Cache: Cache capacity must be greater than 0.`);
    extend(this.settings, opts);
    this.mode = this.settings.mode === 'auto'
      ? capacity < 100 ? 'LRU' : 'DW'
      : this.settings.mode;
    const { indexes, entries } = this.settings.data;
    const LFU = indexes[1].slice(0, capacity);
    const LRU = indexes[0].slice(0, capacity - LFU.length);
    this.indexes = {
      LRU,
      LFU,
    };
    for (const [key, value] of entries) {
      value === undefined
        ? this.nullish ??= true
        : undefined;
      this.store.set(key, value);
    }
    if (!opts.data) return;
    for (let i = LFU.length; i < indexes[1].length; ++i) {
      this.store.delete(LFU[i]);
    }
    for (let i = LRU.length; i < indexes[0].length; ++i) {
      this.store.delete(LRU[i]);
    }
    assert(this.store.size === LFU.length + LRU.length);
    assert([...LFU, ...LRU].every(k => this.store.has(k)));
  }
  private readonly settings: DeepRequired<CacheOptions<K, V>> = {
    ignore: {
      delete: false,
      clear: false,
    },
    data: {
      indexes: [[], []],
      entries: [],
    },
    callback: noop,
    mode: 'auto',
  };
  private nullish = false;
  private hit = false;
  public put(this: Cache<K, undefined>, key: K, value?: V): boolean;
  public put(key: K, value: V): boolean;
  public put(key: K, value: V): boolean {
    value === undefined
      ? this.nullish ??= true
      : undefined;
    const val = this.get(key)!;
    if (this.hit) {
      if (value !== val || value !== value && val !== val) {
        this.store.set(key, value)
      }
      return true;
    }

    const { LRU, LFU } = this.indexes;

    if (this.size === this.capacity) {
      if (LFU.length > this.capacity * this.ratio / 100 || LFU.length === this.capacity) {
        assert(this.mode !== 'LRU');
        assert(LFU.length > 0);
        const key = LFU.pop()!;
        assert(this.store.has(key));
        const val = this.store.get(key)!;
        this.store.delete(key);
        this.settings.callback(key, val);
      }
      else {
        assert(LRU.length > 0);
        const key = LRU.pop()!;
        assert(this.store.has(key));
        const val = this.store.get(key)!;
        this.store.delete(key);
        this.settings.callback(key, val);
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
    const hit = this.hit = val !== undefined || this.nullish && this.has(key);
    return hit && this.access(key)
      ? val
      : undefined;
  }
  public has(key: K): boolean {
    return this.store.has(key);
  }
  public delete(key: K): boolean {
    if (!this.has(key)) return false;
    const { LRU, LFU } = this.indexes;
    for (const stat of [LFU, LRU]) {
      const index = indexOf(stat, key);
      if (index === -1) continue;
      const val = this.store.get(key)!;
      this.store.delete(splice(stat, index, 1)[0]);
      if (this.settings.ignore.delete) return true;
      this.settings.callback(key, val);
      return true;
    }
    return false;
  }
  public clear(): void {
    const store = this.store;
    this.store = new Map();
    this.indexes = {
      LRU: [],
      LFU: [],
    };
    this.stats = {
      LRU: [[0, 0], [0, 0]],
      LFU: [[0, 0], [0, 0]],
    };
    if (this.settings.ignore.clear) return;
    for (const kv of store) {
      this.settings.callback(kv[0], kv[1]);
    }
  }
  public get size(): number {
    assert(this.indexes.LRU.length + this.indexes.LFU.length === this.store.size);
    return this.indexes.LRU.length + this.indexes.LFU.length;
  }
  public [Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    return this.store[Symbol.iterator]();
  }
  public export(): NonNullable<CacheOptions<K, V>['data']> {
    return {
      indexes: [this.indexes.LRU.slice(), this.indexes.LFU.slice()],
      entries: [...this],
    };
  }
  public inspect(): [K[], K[]] {
    const { LRU, LFU } = this.indexes;
    return [LRU.slice(), LFU.slice()];
  }
  private store = new Map<K, V>();
  private stats: {
    LRU: [[number, number], [number, number]],
    LFU: [[number, number], [number, number]],
  } = {
    LRU: [[0, 0], [0, 0]],
    LFU: [[0, 0], [0, 0]],
  };
  private mode: Exclude<NonNullable<CacheOptions<K, V>['mode']>, 'auto'>;
  private ratio = 50;
  private optimize(): void {
    if (this.mode !== 'DW') return;
    if (this.stats.LRU[0][1] % 10) return;
    const { LRU, LFU } = this.stats;
    // 割当上限まで実割当が減るまで割当上限を再度減らさない
    // 割当上限増減のために境界値を踏まなければならないため上昇幅は下降幅の倍数でなければならない
    if (LFU.length > this.capacity * this.ratio) return;
    assert(LRU[0][1] === LFU[0][1]);
    const window = this.capacity * 3;
    if (LRU[1][1] === 0 && LRU[0][1] < window) return;
    const rateR = rate(window, LRU[0], LRU[1]);
    const rateF = rate(window, LFU[0], LFU[1]);
    const ratio = this.ratio;
    // LFUに収束させる
    // 小さすぎるLRUのために非効率にならないようにする
    // 小さい容量では依然として最小LRUが小さくなりすぎ非効率
    // なぜかLFUとLRUを広く往復させないとヒットレートが上がらない
    if (rateF > rateR && ratio < 90) {
      this.ratio += 5;
    }
    // LRUに収束させない
    // LFUと半々で均等分布においてLRUのみと同等効率
    // これ以下に下げても(LRUを50%超にしても)均等分布ですら効率が悪化する
    else if (rateF < rateR && ratio > 50) {
      //console.log(this.ratio);
      this.ratio -= 5;
    }
    if (LRU[0][1] === window) {
      this.stats = {
        LRU: [[0, 0], LRU[0]],
        LFU: [[0, 0], LFU[0]],
      };
    }
  }
  private indexes: {
    LRU: K[];
    LFU: K[];
  };
  private access(key: K): boolean {
    assert(this.store.has(key));
    const stats = this.mode === 'DW' && this.size === this.capacity
      ? this.stats
      : undefined;
    this.hit = this.accessLFU(key, stats)
    this.hit = this.accessLRU(key, stats) || this.hit;
    this.optimize();
    assert(this.hit);
    return this.hit;
  }
  private accessLRU(key: K, stats?: Cache<K, V>['stats']): boolean {
    assert(this.store.has(key));
    if (this.hit) {
      assert(this.indexes.LRU.indexOf(key) === -1);
      stats && ++stats.LRU[0][1];
      return false;
    }
    const { LRU, LFU } = this.indexes;
    const index = indexOf(LRU, key);
    assert(index > -1 === this.store.has(key));
    stats && ++stats.LRU[0][1];
    if (index === -1) return false;
    stats && ++stats.LRU[0][0];
    index === 0
      ? this.mode !== 'LRU' && LFU.unshift(LRU.shift()!)
      : [LRU[index - 1], LRU[index]] = [LRU[index], LRU[index - 1]];
    return true;
  }
  private accessLFU(key: K, stats?: Cache<K, V>['stats']): boolean {
    assert(this.store.has(key));
    const { LFU } = this.indexes;
    const index = indexOf(LFU, key);
    stats && ++stats.LFU[0][1];
    if (index === -1) return false;
    assert(this.mode !== 'LRU');
    stats && ++stats.LFU[0][0];
    if (index === 0) return true;
    [LFU[index - 1], LFU[index]] = [LFU[index], LFU[index - 1]];
    return true;
  }
}

function rate(window: number, curr: [number, number], prev: [number, number]): number {
  const currRate = curr[0] * 100 / curr[1] | 0;
  const currRatio = curr[1] / window;
  const prevRate = prev[0] * 100 / prev[1] | 0;
  const prevRatio = 1 - currRatio;
  return currRate * currRatio + prevRate * prevRatio | 0;
}
