import { Map } from './global';
import { min } from './alias';
import { IterableCollection } from './collection';
import { OList } from './olist';
import { extend } from './assign';
import { tuple } from './tuple';

// Dual Window Cache

/*
比較検討

ARC:
ゴーストキャッシュの追加による走査コストおよびオーバヘッドの倍化を補えるほどのヒット率の増加を期待できない。

CLOCK(CAR):
当実装の探索高速化手法および木構造と両立しない。

TinyLFU:
一部のワークロードへの最適化、アドミッションポリシーの相性、およびウインドウキャッシュの小ささから
メモ化など他の用途においてLRUに大きく劣るか機能しない懸念がある。
またキーの型の制限、オーバーヘッドの影響度、ならびに想定される前提条件および合理的推定の不一致から
JavaScriptにおける需要を満たさない懸念がある。

*/

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
    if (capacity < 1) throw new Error(`Spica: Cache: Cache capacity must be 1 or more.`);
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
    if (this.has(key)) return this.memory.set(key, value), true;

    const { LRU, LFU } = this.indexes;

    if (this.size === this.capacity) {
      const key = false
        || LFU.length === this.capacity
        || LFU.length > this.capacity * this.ratio / 100
        || LFU.length > this.capacity / 2 && LFU.peek(-1)!.value < this.clock - this.capacity * 8
        ? LFU.pop()!.key
        : LRU.pop()!.key;
      assert(this.memory.has(key));
      if (this.settings.disposer) {
        const val = this.memory.get(key)!;
        this.memory.delete(key);
        this.settings.disposer(key, val);
      }
      else {
        this.memory.delete(key);
      }
    }

    LRU.add(key, ++this.clockR);
    this.memory.set(key, value);
    return false;
  }
  public set(this: Cache<K, undefined>, key: K, value?: V): this;
  public set(key: K, value: V): this;
  public set(key: K, value: V): this {
    this.put(key, value);
    return this;
  }
  public get(key: K): V | undefined {
    const val = this.memory.get(key);
    if (val !== void 0 || this.nullish && this.has(key)) {
      assert(this.memory.has(key));
      this.access(key);
      ++this.stats.Total[0];
      this.slide();
    }
    else {
      assert(!this.memory.has(key));
      ++this.stats.Total[0];
      this.slide();
    }
    return val;
  }
  public has(key: K): boolean {
    //assert(this.memory.has(key) === (this.indexes.LFU.has(key) || this.indexes.LRU.has(key)));
    //assert(this.memory.size === this.indexes.LFU.length + this.indexes.LRU.length);
    return this.memory.has(key);
  }
  public delete(key: K): boolean {
    if (!this.has(key)) return false;
    const { LRU, LFU } = this.indexes;
    for (const index of [LFU, LRU]) {
      const i = index.findIndex(key) ?? -1;
      if (i === -1) continue;
      index.delete(key);
      if (!this.settings.disposer || !this.settings.capture!.delete) {
        this.memory.delete(key);
      }
      else {
        const val = this.memory.get(key)!;
        this.memory.delete(key);
        this.settings.disposer(key, val);
      }
      return true;
    }
    return false;
  }
  public clear(): void {
    this.nullish = false;
    this.ratio = 50;
    this.indexes.LRU.clear();
    this.indexes.LFU.clear();
    this.stats = {
      LRU: [0, 0],
      LFU: [0, 0],
      Total: tuple(0, 0),
    };
    const memory = this.memory;
    this.memory = new Map();
    if (!this.settings.disposer || !this.settings.capture?.clear) return;
    for (const [key, value] of memory) {
      this.settings.disposer(key, value);
    }
  }
  public get size(): number {
    //assert(this.indexes.LRU.length + this.indexes.LFU.length === this.memory.size);
    return this.indexes.LRU.length + this.indexes.LFU.length;
  }
  public [Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    return this.memory[Symbol.iterator]();
  }
  private clock = 0;
  private clockR = 0;
  private memory = new Map<K, V>();
  private readonly indexes = {
    LRU: new OList<K, number>(this.capacity),
    LFU: new OList<K, number>(this.capacity),
  } as const;
  private stats = {
    LRU: tuple(0, 0),
    LFU: tuple(0, 0),
    Total: tuple(0, 0),
  };
  private ratio = 50;
  private slide(): void {
    const { LRU, LFU, Total } = this.stats;
    // 速度への影響を確認できなかったため毎回再計算
    //if ((LRU[0] + LFU[0]) % step) return;
    const { capacity, ratio, indexes } = this;
    const window = capacity;
    const rateR = rate(window, LRU[0], LRU[0] + LFU[0], LRU[1], LRU[1] + LFU[1]);
    const rateF = rate(window, LFU[0], LRU[0] + LFU[0], LFU[1], LRU[1] + LFU[1]) * indexes.LRU.length / indexes.LFU.length | 0;
    const isCalculable = Total[1] > 0;
    const isLRUFilled = indexes.LRU.length >= capacity * (100 - ratio) / 100;
    const isLFUFilled = indexes.LFU.length >= capacity * ratio / 100;
    const step = 1;
    if (isCalculable && ratio < 100 && isLFUFilled && rateF > rateR) {
      //ratio % 10 || console.debug('+', this.ratio, LRU, LFU, Total);
      this.ratio += step;
    }
    // LRUに収束させない
    else
    if (isCalculable && ratio > 10 && isLRUFilled && rateR > rateF) {
      //ratio % 10 || console.debug('-', this.ratio, LRU, LFU, Total);
      this.ratio -= step;
    }
    assert(LRU[0] + LFU[0] <= window);
    assert(LRU[1] + LFU[1] <= window);
    if (LRU[0] + LFU[0] === window) {
      this.stats = {
        LRU: [0, LRU[0]],
        LFU: [0, LFU[0]],
        Total: [0, Total[0]],
      };
    }
  }
  private access(key: K): boolean {
    const hit = false
      || this.accessLFU(key)
      || this.accessLRU(key);
    assert(hit === this.memory.has(key));
    assert(hit);
    return hit;
  }
  private accessLRU(key: K): boolean {
    const { LRU, LFU } = this.indexes;
    const index = LRU.findIndex(key) ?? -1;
    assert(index > -1 === this.memory.has(key));
    if (index === -1) return false;
    ++this.stats.LRU[0];
    ++this.clock;
    ++this.clockR;
    if (LRU.node(index).value + LRU.length / 3 > this.clockR) {
      LRU.put(key, this.clockR);
      LRU.raiseToTop(index);
      return true;
    }
    LRU.delete(key);
    LFU.add(key, this.clock);
    return true;
  }
  private accessLFU(key: K): boolean {
    const { LFU } = this.indexes;
    const index = LFU.findIndex(key) ?? -1;
    if (index === -1) return false;
    ++this.stats.LFU[0];
    ++this.clock;
    if (index === LFU.peek()!.index) return true;
    LFU.put(key, this.clock);
    LFU.raiseToTop(index);
    return true;
  }
}

function rate(window: number, currHits: number, currTotal: number, prevHits: number, prevTotal: number): number {
  window = min(currTotal + prevTotal, window);
  const currRate = currHits * 100 / currTotal | 0;
  const currRatio = min(currTotal * 100 / window, 100);
  const prevRate = prevHits * 100 / prevTotal | 0;
  const prevRatio = 100 - currRatio;
  return currRate * currRatio + prevRate * prevRatio | 0;
}
assert(rate(10, 5, 10, 0, 0) === 5000);
assert(rate(10, 0, 0, 5, 10) === 5000);
