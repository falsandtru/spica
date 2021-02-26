import { Map } from './global';
import { min } from './alias';
import { IterableCollection } from './collection';
import { OList } from './olist';
import { extend } from './assign';
import { tuple } from './tuple';

// Dual Window Cache

// いくつかのキャッシュ破壊防止能力が欠けているがLRUの上位互換としてLRUを置換できることを優先する

/*
比較検討

ARC:
ゴーストキャッシュの追加による走査コストおよびオーバヘッドを補えるほどのヒット率の増加を期待できない。

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
    if (this.has(key)) return this.memory.set(key, value), true;

    const { LRU, LFU } = this.indexes;

    if (this.size === this.capacity) {
      const key = LFU.length === this.capacity || LFU.length > this.capacity * this.ratio / 100
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

    LRU.add(key);
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
    this.indexes = {
      LRU: new OList(this.capacity),
      LFU: new OList(this.capacity),
    };
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
  private memory = new Map<K, V>();
  private indexes = {
    LRU: new OList<K>(this.capacity),
    LFU: new OList<K>(this.capacity),
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
    const capacity = this.capacity;
    const window = capacity;
    const rateR = rate(window, LRU[0], LRU[0] + LFU[0], LRU[1], LRU[1] + LFU[1]);
    const rateF = 10000 - rateR;
    const ratio = this.ratio;
    const step = 1;
    // LFUに収束させる
    // なぜかLFUとLRUを広く往復させないとヒット率が上がらない
    if (ratio < 100 && rateF > rateR * 1.01) {
      this.ratio += step;
    }
    // LRUに収束させない
    // LFUと半々で均等分布においてLRUのみと同等効率
    // これ以下に下げても(LRUを50%超にしても)均等分布ですら効率が悪化する
    else
    if (ratio > 50 && rateR > rateF * 1.01) {
      //console.log(this.ratio);
      this.ratio -= step;
    }
    // シーケンシャルおよび推移的アクセスパターンへの対処
    // 削除しても他のパターンに悪影響なし
    else
    if (ratio <= 50 && this.indexes.LRU.length >= capacity * (100 - ratio) / 100) {
      // シーケンシャルアクセスでLRUの拡大を制限しLFUを保護
      if (rateR <= rateF && rate(window / 2 | 0, LRU[0], Total[0], LRU[1], Total[1]) < 100) {
        //console.log(this.ratio, LRU, Total, rate(window / 2 | 0, LRU[0], Total[0], LRU[1], Total[1]));
        this.ratio = 50;
      }
      // 推移的アクセスでLRUを拡大
      else
      if (ratio > 10 && rate(window / 2 | 0, LFU[0], Total[0], LFU[1], Total[1]) * 2 <= rate(window, LFU[0], Total[0], LFU[1], Total[1])) {
        //console.log(this.ratio, rateR, rateF, rate(window / 2 | 0, LFU[0], Total[0], LFU[1], Total[1]), rate(window, LFU[0], Total[0], LFU[1], Total[1]));
        this.ratio -= step;
      }
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
    const stats = this.stats;
    const hit = false
      || this.accessLFU(key, stats)
      || this.accessLRU(key, stats);
    assert(hit === this.memory.has(key));
    assert(hit);
    return hit;
  }
  private accessLRU(key: K, stats: Cache<K, V>['stats']): boolean {
    const { LRU } = this.indexes;
    const index = LRU.findIndex(key) ?? -1;
    assert(index > -1 === this.memory.has(key));
    if (index === -1) return false;
    ++stats.LRU[0];
    if (index === LRU.peek()!.index) return !this.indexes.LFU.add(LRU.shift()!.key);
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
  const currRatio = min(currTotal * 100 / window, 100);
  const prevRate = prevHits * 100 / prevTotal;
  const prevRatio = 100 - currRatio;
  return currRate * currRatio + prevRate * prevRatio | 0;
}
