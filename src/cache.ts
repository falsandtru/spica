import type { DeepImmutable, DeepRequired } from './type';
import { undefined, Map } from './global';
import { IterableCollection } from './collection';
import { extend } from './assign';
import { indexOf, splice } from './array';

export interface CacheOptions<K, V = undefined> {
  ignore?: {
    delete?: boolean;
    clear?: boolean;
  };
  data?: {
    indexes: [K[], K[]];
    entries: [K, V][];
  };
}

export class Cache<K, V = undefined> implements IterableCollection<K, V> {
  constructor(
    private readonly capacity: number,
    private readonly callback: (key: K, value: V) => void = () => undefined,
    opts: {
      ignore?: {
        delete?: boolean;
        clear?: boolean;
      };
      data?: {
        indexes: [K[], K[]];
        entries: [K, V][];
      };
    } = {},
  ) {
    if (capacity > 0 === false) throw new Error(`Spica: Cache: Cache capacity must be greater than 0.`);
    extend(this.settings, opts);
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
  private readonly settings: DeepImmutable<DeepRequired<CacheOptions<K, V>>, unknown[]> = {
    ignore: {
      delete: false,
      clear: false,
    },
    data: {
      indexes: [[], []],
      entries: [],
    },
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
    if (LFU.length === this.capacity ||
        this.size === this.capacity && LFU.length > this.capacity * this.ratio / 100) {
      assert(LFU.length > 0);
      const key = LFU.pop()!;
      assert(this.store.has(key));
      const val = this.store.get(key)!;
      this.store.delete(key);
      this.callback(key, val);
    }

    LRU.unshift(key);
    this.store.set(key, value);

    if (this.size > this.capacity) {
      assert(LRU.length > 0);
      const key = LRU.pop()!;
      assert(this.store.has(key));
      const val = this.store.get(key)!;
      this.store.delete(key);
      this.callback(key, val);
    }
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
    const hit = this.hit = val !== undefined || this.nullish && this.store.has(key);
    return hit && this.access(key)
      ? val
      : undefined;
  }
  public has(key: K): boolean {
    return this.store.has(key);
  }
  public delete(key: K): boolean {
    if (!this.store.has(key)) return false;
    const { LRU, LFU } = this.indexes;
    for (const stat of [LFU, LRU]) {
      const index = indexOf(stat, key);
      if (index === -1) continue;
      const val = this.store.get(key)!;
      this.store.delete(splice(stat, index, 1)[0]);
      if (this.settings.ignore.delete) return true;
      this.callback(key, val);
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
      this.callback(kv[0], kv[1]);
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
  private ratio = 50;
  private stats: {
    LRU: [[number, number], [number, number]],
    LFU: [[number, number], [number, number]],
  } = {
    LRU: [[0, 0], [0, 0]],
    LFU: [[0, 0], [0, 0]],
  };
  private optimize(): void {
    if (this.stats.LRU[0][1] % 10) return;
    const { LRU, LFU } = this.stats;
    if (LFU.length > this.capacity * this.ratio) return;
    assert(LRU[0][1] === LFU[0][1]);
    const window = this.capacity * 3;
    if (LRU[1][1] === 0 && LRU[0][1] < window) return;
    const rateR = rate(window, LRU[0], LRU[1]);
    const rateF = rate(window, LFU[0], LFU[1]);
    const ratio = this.ratio;
    // LFUに収束させる
    if (rateF > rateR && ratio < 100) {
      this.ratio += 5;
    }
    // LRUに収束させない
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
    const stats = this.size === this.capacity
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
    const LRU = this.indexes.LRU;
    const index = indexOf(LRU, key);
    assert(index > -1 === this.has(key));
    stats && ++stats.LRU[0][1];
    if (index === -1) return false;
    stats && ++stats.LRU[0][0];
    const LFU = this.indexes.LFU;
    index === 0
      ? LFU.unshift(LRU.shift()!)
      : [LRU[index - 1], LRU[index]] = [LRU[index], LRU[index - 1]];
    return true;
  }
  private accessLFU(key: K, stats?: Cache<K, V>['stats']): boolean {
    assert(this.store.has(key));
    const LFU = this.indexes.LFU;
    const index = indexOf(LFU, key);
    stats && ++stats.LFU[0][1];
    if (index === -1) return false;
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
