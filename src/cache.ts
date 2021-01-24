import type { DeepImmutable, DeepRequired } from './type';
import { undefined, Map } from './global';
import { IterableCollection } from './collection';
import { extend } from './assign';
import { indexOf, push, splice } from './array';

export interface CacheOptions<K, V = undefined> {
  ignore?: {
    delete?: boolean;
    clear?: boolean;
  };
  data?: {
    stats: [K[], K[]];
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
        stats: [K[], K[]];
        entries: [K, V][];
      };
    } = {},
  ) {
    if (capacity > 0 === false) throw new Error(`Spica: Cache: Cache capacity must be greater than 0.`);
    extend(this.settings, opts);
    const { stats, entries } = this.settings.data;
    const LFU = stats[1].slice(0, capacity);
    const LRU = stats[0].slice(0, capacity - LFU.length);
    this.stats = {
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
    for (const key of push(stats[1].slice(LFU.length), stats[0].slice(LRU.length))) {
      this.store.delete(key);
    }
    if (this.store.size !== LFU.length + LRU.length) throw new Error(`Spica: Cache: Size of stats and entries is not matched.`);
    if (![...LFU, ...LRU].every(k => this.store.has(k))) throw new Error(`Spica: Cache: Keys of stats and entries is not matched.`);
  }
  private readonly settings: DeepImmutable<DeepRequired<CacheOptions<K, V>>, unknown[]> = {
    ignore: {
      delete: false,
      clear: false,
    },
    data: {
      stats: [[], []],
      entries: [],
    },
  };
  private nullish = false;
  public put(this: Cache<K, undefined>, key: K, value?: V): boolean;
  public put(key: K, value: V): boolean;
  public put(key: K, value: V): boolean {
    value === undefined
      ? this.nullish ??= true
      : undefined;
    const hit = this.store.has(key);
    if (hit && this.access(key)) return this.store.set(key, value), true;

    const { LRU, LFU } = this.stats;
    if (LRU.length + LFU.length === this.capacity && LRU.length < LFU.length) {
      assert(LFU.length > 0);
      const key = LFU.pop()!;
      assert(this.store.has(key));
      const val = this.store.get(key)!;
      this.store.delete(key);
      this.callback(key, val);
    }

    LRU.unshift(key);
    this.store.set(key, value);

    if (LRU.length + LFU.length > this.capacity) {
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
    const hit = val !== undefined || this.nullish && this.store.has(key);
    return hit && this.access(key)
      ? val
      : undefined;
  }
  public has(key: K): boolean {
    return this.store.has(key);
  }
  public delete(key: K): boolean {
    if (!this.store.has(key)) return false;
    const { LRU, LFU } = this.stats;
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
    this.stats = {
      LRU: [],
      LFU: [],
    };
    if (this.settings.ignore.clear) return;
    for (const kv of store) {
      this.callback(kv[0], kv[1]);
    }
  }
  public get size(): number {
    return this.store.size;
  }
  public [Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    return this.store[Symbol.iterator]();
  }
  public export(): NonNullable<CacheOptions<K, V>['data']> {
    return {
      stats: [this.stats.LRU.slice(), this.stats.LFU.slice()],
      entries: [...this],
    };
  }
  public inspect(): [K[], K[]] {
    const { LRU, LFU } = this.stats;
    return [LRU.slice(), LFU.slice()];
  }
  private store = new Map<K, V>();
  private stats: {
    LRU: K[];
    LFU: K[];
  };
  private access(key: K): boolean {
    assert(this.store.has(key));
    return this.accessLFU(key)
        || this.accessLRU(key);
  }
  private accessLRU(key: K): boolean {
    assert(this.store.has(key));
    const { LRU } = this.stats;
    const index = indexOf(LRU, key);
    assert(index > -1 === this.has(key));
    if (index === -1) return false;
    const { LFU } = this.stats;
    LFU.unshift(splice(LRU, index, 1)[0]);
    return true;
  }
  private accessLFU(key: K): boolean {
    assert(this.store.has(key));
    const { LFU } = this.stats;
    const index = indexOf(LFU, key);
    if (index === -1) return false;
    if (index === 0) return true;
    LFU.unshift(splice(LFU, index, 1)[0]);
    return true;
  }
}
