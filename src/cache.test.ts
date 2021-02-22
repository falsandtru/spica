import { Cache } from './cache';

describe('Unit: lib/cache', () => {
  describe('Cache', () => {
    function inspect<K, V>(cache: Cache<K, V>) {
      return {
        LRU: [...cache['indexes'].LRU].map(([k]) => k),
        LFU: [...cache['indexes'].LFU].map(([k]) => k),
        store: [...cache['store']],
      };
    }

    it('put/has/delete 1', () => {
      const cache = new Cache<number, number>(1);

      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        store: [],
      });

      assert(cache.has(0) === false);
      assert(cache.get(0) === undefined);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        store: [],
      });

      assert(cache.has(0) === false);
      assert(cache.put(0, 0) === false);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [0],
        LFU: [],
        store: [[0, 0]],
      });

      assert(cache.has(0) === true);
      assert(cache.put(0, 1) === true);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [0],
        LFU: [],
        store: [[0, 1]],
      });

      assert(cache.get(0) === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [0],
        store: [[0, 1]],
      });

      assert(cache.has(0) === true);
      assert(cache.put(0, 0) === true);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [0],
        store: [[0, 0]],
      });

      assert(cache.get(0) === 0);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [0],
        store: [[0, 0]],
      });

      assert(cache.has(0) === true);
      assert(cache.delete(0) === true);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        store: [],
      });

      assert(cache.delete(0) === false);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        store: [],
      });
    });

    it('put/has/delete 2', () => {
      let key: number | undefined;
      let val: number | undefined;
      let cnt = 0;
      const cache = new Cache<number, number>(2, { disposer: (k, v) => (key = k, val = v, ++cnt) });

      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        store: [],
      });

      assert(cache.put(0, 0) === false);
      assert(key === undefined && val === undefined && cnt === 0);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [0],
        LFU: [],
        store: [[0, 0]],
      });

      assert(cache.put(1, 1) === false);
      assert(key === undefined && val === undefined && cnt === 0);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1, 0],
        LFU: [],
        store: [[0, 0], [1, 1]],
      });

      assert(cache.put(1, 1) === true);
      assert(key === undefined && val === undefined && cnt === 0);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1, 0],
        LFU: [],
        store: [[0, 0], [1, 1]],
      });

      assert(cache.get(1) === 1);
      assert(key === undefined && val === undefined && cnt === 0);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [0],
        LFU: [1],
        store: [[0, 0], [1, 1]],
      });

      assert(cache.put(2, 2) === false);
      assert(key === 0 && val === 0 && cnt === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [2],
        LFU: [1],
        store: [[1, 1], [2, 2]],
      });

      assert(cache.get(2) === 2);
      assert(key === 0 && val === 0 && cnt === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [2, 1],
        store: [[1, 1], [2, 2]],
      });

      assert(cache.get(2) === 2);
      assert(key === 0 && val === 0 && cnt === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [2, 1],
        store: [[1, 1], [2, 2]],
      });

      assert(cache.get(1) === 1);
      assert(key === 0 && val === 0 && cnt === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [1, 2],
        store: [[1, 1], [2, 2]],
      });

      assert(cache.put(3, 3) === false);
      assert(key === 2 && val === 2 && cnt === 2);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [3],
        LFU: [1],
        store: [[1, 1], [3, 3]],
      });

      assert(cache.clear() === undefined);
      assert(key === 3 && val === 3 && cnt === 4);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        store: [],
      });
    });

    class LRUCache<K, V> {
      constructor(public capacity: number) {
      }
      public index: K[] = [];
      public entries = new Map<K, V>();
      public put(key: K, val: V): boolean {
        const { index, entries } = this;
        const i = index.indexOf(key);
        if (index.length === this.capacity) {
          i === -1
            ? entries.delete(index.pop()!)
            : index.splice(i, 1);
        }
        else {
          i > -1 && index.splice(i, 1);
        }
        index.unshift(key);
        entries.set(key, val);
        assert(index.length <= this.capacity);
        assert(index.length === entries.size);
        return i > -1;
      }
    }

    class LFUCache<K, V> {
      constructor(public capacity: number) {
      }
      public index: K[] = [];
      public entries = new Map<K, V>();
      public put(key: K, val: V): boolean {
        const { index, entries } = this;
        const i = index.indexOf(key);
        switch (i) {
          case -1:
            index.length === this.capacity && entries.delete(index.pop()!);
            index.unshift(key);
            break;
          case 0:
            break;
          default:
            [index[i - 1], index[i]] = [index[i], index[i - 1]];
        }
        entries.set(key, val);
        assert(index.length <= this.capacity);
        assert(index.length === entries.size);
        return i > -1;
      }
    }

    it('rate even 10', function () {
      this.timeout(10 * 1e3);
      this.retries(5);

      const capacity = 10;
      const lru = new LRUCache<number, number>(capacity);
      const lfu = new LFUCache<number, number>(capacity);
      const dwc = new Cache<number, number>(capacity);

      const repeat = capacity * 1000;
      const warmup = capacity * 1000;
      let hitlru = 0;
      let hitlfu = 0;
      let hitdwc = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        const key = Math.random() * capacity * 10 | 0;
        hitlru += +lru.put(key, i);
        hitlfu += +lfu.put(key, i);
        dwc.get(key);
        hitdwc += +dwc.put(key, i);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitlfu = 0;
          hitdwc = 0;
        }
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['store'].size);
      assert(dwc['store'].size <= capacity);
      console.debug('LRU hit rate even 10', hitlru * 100 / repeat);
      console.debug('LFU hit rate even 10', hitlfu * 100 / repeat);
      console.debug('DWC hit rate even 10', hitdwc * 100 / repeat);
      console.debug('DWC / LRU hit rate ratio even 10', `${hitdwc / hitlru * 100 | 0}%`);
      assert(hitdwc / hitlru * 100 > 95);
    });

    it('rate uneven 10', function () {
      this.timeout(10 * 1e3);
      this.retries(5);

      const capacity = 10;
      const lru = new LRUCache<number, number>(capacity);
      const lfu = new LFUCache<number, number>(capacity);
      const dwc = new Cache<number, number>(capacity);

      const repeat = capacity * 1000;
      const warmup = capacity * 1000;
      let hitlru = 0;
      let hitlfu = 0;
      let hitdwc = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        const key = Math.random() < 0.4
          ? Math.random() * capacity * 1 | 0
          : Math.random() * capacity * 9 + capacity | 0;
        hitlru += +lru.put(key, i);
        hitlfu += +lfu.put(key, i);
        dwc.get(key);
        hitdwc += +dwc.put(key, i);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitlfu = 0;
          hitdwc = 0;
        }
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['store'].size);
      assert(dwc['store'].size <= capacity);
      console.debug('LRU hit rate uneven 10', hitlru * 100 / repeat);
      console.debug('LFU hit rate uneven 10', hitlfu * 100 / repeat);
      console.debug('DWC hit rate uneven 10', hitdwc * 100 / repeat);
      console.debug('DWC / LRU hit rate ratio uneven 10', `${hitdwc / hitlru * 100 | 0}%`);
      assert(hitdwc / hitlru * 100 > 170);
    });

    it('rate even 100', function () {
      if (!navigator.userAgent.includes('Chrome')) return;
      this.timeout(10 * 1e3);
      this.retries(3);

      const capacity = 100;
      const lru = new LRUCache<number, number>(capacity);
      const lfu = new LFUCache<number, number>(capacity);
      const dwc = new Cache<number, number>(capacity);

      const repeat = capacity * 1000;
      const warmup = capacity * 1000;
      let hitlru = 0;
      let hitlfu = 0;
      let hitdwc = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        const key = Math.random() * capacity * 10 | 0;
        hitlru += +lru.put(key, i);
        hitlfu += +lfu.put(key, i);
        dwc.get(key);
        hitdwc += +dwc.put(key, i);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitlfu = 0;
          hitdwc = 0;
        }
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['store'].size);
      assert(dwc['store'].size <= capacity);
      console.debug('LRU hit rate even 100', hitlru * 100 / repeat);
      console.debug('LFU hit rate even 100', hitlfu * 100 / repeat);
      console.debug('DWC hit rate even 100', hitdwc * 100 / repeat);
      console.debug('DWC / LRU hit rate ratio even 100', `${hitdwc / hitlru * 100 | 0}%`);
      assert(hitdwc / hitlru * 100 > 100);
    });

    it('rate uneven 100', function () {
      if (!navigator.userAgent.includes('Chrome')) return;
      this.timeout(10 * 1e3);
      this.retries(3);

      const capacity = 100;
      const lru = new LRUCache<number, number>(capacity);
      const lfu = new LFUCache<number, number>(capacity);
      const dwc = new Cache<number, number>(capacity);

      const repeat = capacity * 1000;
      const warmup = capacity * 1000;
      let hitlru = 0;
      let hitlfu = 0;
      let hitdwc = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        // DWCは静的な偏りの抽出能力が高いだけのようだが偏りがない場合でもLRUとほぼ遜色ない
        const key = Math.random() < 0.4
          ? Math.random() * capacity * 1 | 0
          : Math.random() * capacity * 9 + capacity | 0;
        hitlru += +lru.put(key, i);
        hitlfu += +lfu.put(key, i);
        dwc.get(key);
        hitdwc += +dwc.put(key, i);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitlfu = 0;
          hitdwc = 0;
        }
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['store'].size);
      assert(dwc['store'].size <= capacity);
      console.debug('LRU hit rate uneven 100', hitlru * 100 / repeat);
      console.debug('LFU hit rate uneven 100', hitlfu * 100 / repeat);
      console.debug('DWC hit rate uneven 100', hitdwc * 100 / repeat);
      console.debug('DWC / LRU hit rate ratio uneven 100', `${hitdwc / hitlru * 100 | 0}%`);
      assert(hitdwc / hitlru * 100 > 200);
    });

    it('rate uneven 100 transitive distribution', function () {
      if (!navigator.userAgent.includes('Chrome')) return;
      this.timeout(10 * 1e3);
      this.retries(3);

      const capacity = 100;
      const lru = new LRUCache<number, number>(capacity);
      const lfu = new LFUCache<number, number>(capacity);
      const dwc = new Cache<number, number>(capacity);

      const repeat = capacity * 1000;
      const warmup = capacity * 1000;
      let hitlru = 0;
      let hitlfu = 0;
      let hitdwc = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        const key = Math.random() < 0.4
          ? Math.random() * capacity * 1 | 0
          // Transitive distribution
          // DWCは推移的な分散には影響されない
          : Math.random() * capacity * 9 + capacity + i | 0;
        hitlru += +lru.put(key, i);
        hitlfu += +lfu.put(key, i);
        dwc.get(key);
        hitdwc += +dwc.put(key, i);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitlfu = 0;
          hitdwc = 0;
        }
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['store'].size);
      assert(dwc['store'].size <= capacity);
      console.debug('LRU hit rate uneven 100 transitive distribution', hitlru * 100 / repeat);
      console.debug('LFU hit rate uneven 100 transitive distribution', hitlfu * 100 / repeat);
      console.debug('DWC hit rate uneven 100 transitive distribution', hitdwc * 100 / repeat);
      console.debug('DWC / LRU hit rate ratio uneven 100 transitive distribution', `${hitdwc / hitlru * 100 | 0}%`);
      assert(hitdwc / hitlru * 100 > 200);
    });

    it('rate uneven 100 transitive bias', function () {
      if (!navigator.userAgent.includes('Chrome')) return;
      this.timeout(10 * 1e3);
      this.retries(3);

      const capacity = 100;
      const lru = new LRUCache<number, number>(capacity);
      const lfu = new LFUCache<number, number>(capacity);
      const dwc = new Cache<number, number>(capacity);

      const repeat = capacity * 1000;
      const warmup = capacity * 1000;
      let hitlru = 0;
      let hitlfu = 0;
      let hitdwc = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        const key = Math.random() < 0.4
          // Transitive bias
          // DWCは推移的な偏りに弱い
          // 偏りの抽出が分布全体の推移により無効化され逆効果になるからであろう
          // 偏りの抽出によりLRUより精度を上げようとするキャッシュアルゴリズム全般のトレードオフと思われる
          // 単純に大きな分布なら問題ないが大きな分布の中で局所性の変化による疑似的な推移が生じる可能性はある
          // しかし推移により常に抽出を無効化し続ける状況は通常のアクセスパターンからは考えにくく
          // そのような状況が生じるならキャッシュサイズが小さすぎることに問題があることのほうが多いだろう
          ? Math.random() * capacity * 1 - i / 10 | 0
          : Math.random() * capacity * 9 + capacity + i | 0;
        hitlru += +lru.put(key, i);
        hitlfu += +lfu.put(key, i);
        dwc.get(key);
        hitdwc += +dwc.put(key, i);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitlfu = 0;
          hitdwc = 0;
        }
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['store'].size);
      assert(dwc['store'].size <= capacity);
      console.debug('LRU hit rate uneven 100 transitive bias', hitlru * 100 / repeat);
      console.debug('LFU hit rate uneven 100 transitive bias', hitlfu * 100 / repeat);
      console.debug('DWC hit rate uneven 100 transitive bias', hitdwc * 100 / repeat);
      console.debug('DWC / LRU hit rate ratio uneven 100 transitive bias', `${hitdwc / hitlru * 100 | 0}%`);
      assert(hitdwc / hitlru * 100 > 80);
    });

  });

});
