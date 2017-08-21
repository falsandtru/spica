import { findIndex } from './equal';

export class Cache<K, V = void> {
  constructor(
    private readonly size: number,
    private readonly callback: (key: K, value: V) => void = () => void 0,
    {
      stats = [[], []],
      entries = [],
    }: {
      stats?: [K[], K[]];
      entries?: [K, V][];
    } = {},
  ) {
    if (size > 0 === false) throw new Error(`Spica: Cache: Cache size must be greater than 0.`);
    const LFU = stats[1].slice(0, size);
    const LRU = stats[0].slice(0, size - LFU.length);
    this.stats = {
      LRU,
      LFU,
    };
    this.store = new Map(entries.slice(0, size));
    if (this.store.size !== LFU.length + LRU.length) throw new Error(`Spica: Cache: Size of stats and entries is not matched.`);
    if (!LFU.concat(LRU).every(k => this.store.has(k))) throw new Error(`Spica: Cache: Keys of stats and entries is not matched.`);
  }
  public put(key: K, value: V, log?: boolean): boolean;
  public put(this: Cache<K, void>, key: K, value?: V): boolean;
  public put(key: K, value: V, log = true): boolean {
    if (!log && this.store.has(key)) return void this.store.set(key, value), true;
    if (this.access(key)) return void this.store.set(key, value), true;

    const {LRU, LFU} = this.stats;
    if (LRU.length + LFU.length === this.size && LRU.length < LFU.length) {
      assert(LFU.length > 0);
      const key = LFU.pop()!;
      assert(this.store.has(key));
      const val = this.store.get(key)!;
      void this.store.delete(key);
      void this.callback(key, val);
    }

    void LRU.unshift(key);
    void this.store.set(key, value);

    if (LRU.length + LFU.length > this.size) {
      assert(LRU.length > 0);
      const key = LRU.pop()!;
      assert(this.store.has(key));
      const val = this.store.get(key)!;
      void this.store.delete(key);
      void this.callback(key, val);
    }
    return false;
  }
  public set(key: K, value: V, log?: boolean): V;
  public set(this: Cache<K, void>, key: K, value?: V): V;
  public set(key: K, value: V, log?: boolean): V {
    void this.put(key, value, log);
    return value;
  }
  public get(key: K): V | undefined {
    void this.access(key);
    return this.store.get(key);
  }
  public has(key: K): boolean {
    return this.store.has(key);
  }
  public delete(key: K): boolean {
    if (!this.store.has(key)) return false;
    const {LRU, LFU} = this.stats;
    for (const log of [LFU, LRU]) {
      const index = findIndex(key, log);
      if (index === -1) continue;
      const val = this.store.get(key)!;
      void this.store.delete(log.splice(index, 1)[0]);
      void this.callback(key, val);
      return true;
    }
    return false;
  }
  public clear(): void {
    const entries = Array.from(this);
    this.store = new Map();
    this.stats = {
      LRU: [],
      LFU: [],
    };
    return void entries
      .forEach(([key, val]) =>
        void this.callback(key, val));
  }
  public [Symbol.iterator](): Iterator<[K, V]> {
    return this.store[Symbol.iterator]();
  }
  public export(): { stats: [K[], K[]]; entries: [K, V][]; } {
    return {
      stats: [this.stats.LRU.slice(), this.stats.LFU.slice()],
      entries: Array.from(this),
    };
  }
  public inspect(): [K[], K[]] {
    const {LRU, LFU} = this.stats;
    return [LRU.slice(), LFU.slice()];
  }
  private store: Map<K, V>;
  private stats: {
    LRU: K[];
    LFU: K[];
  };
  private access(key: K): boolean {
    return this.accessLFU(key)
        || this.accessLRU(key);
  }
  private accessLRU(key: K): boolean {
    if (!this.store.has(key)) return false;
    const {LRU} = this.stats;
    const index = findIndex(key, LRU);
    if (index === -1) return false;
    const {LFU} = this.stats;
    void LFU.unshift(...LRU.splice(index, 1));
    return true;
  }
  private accessLFU(key: K): boolean {
    if (!this.store.has(key)) return false;
    const {LFU} = this.stats;
    const index = findIndex(key, LFU);
    if (index === -1) return false;
    void LFU.unshift(...LFU.splice(index, 1));
    return true;
  }
}
