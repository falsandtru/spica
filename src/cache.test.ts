import { Cache } from './cache';
import LRUCache from 'lru-cache';
import { wait } from './clock';

describe('Unit: lib/cache', () => {
  describe('Cache', () => {
    function inspect<K, V>(cache: Cache<K, V>) {
      return {
        LRU: [...cache['indexes'].LRU].map(i => i.key),
        LFU: [...cache['indexes'].LFU].map(i => i.key),
        memory: [...cache['memory']].map(([key, { value }]) => [key, value]),
      };
    }

    it('put/has/delete 1', () => {
      const cache = new Cache<number, number>(1);

      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        memory: [],
      });

      assert(cache.has(0) === false);
      assert(cache.get(0) === undefined);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        memory: [],
      });

      assert(cache.has(0) === false);
      assert(cache.put(0, 0) === false);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [0],
        LFU: [],
        memory: [[0, 0]],
      });

      assert(cache.has(0) === true);
      assert(cache.put(0, 1) === true);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [0],
        LFU: [],
        memory: [[0, 1]],
      });

      assert(cache.get(0) === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [0],
        memory: [[0, 1]],
      });

      assert(cache.has(0) === true);
      assert(cache.put(0, 0) === true);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [0],
        memory: [[0, 0]],
      });

      assert(cache.get(0) === 0);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [0],
        memory: [[0, 0]],
      });

      assert(cache.has(0) === true);
      assert(cache.delete(0) === true);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        memory: [],
      });

      assert(cache.delete(0) === false);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        memory: [],
      });
    });

    it('put/has/delete 2', () => {
      let key: number | undefined;
      let val: number | undefined;
      let cnt = 0;
      const cache = new Cache<number, number>(2, { disposer: (v, k) => (key = k, val = v, ++cnt) });

      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        memory: [],
      });

      assert(cache.put(0, 0) === false);
      assert(key === undefined && val === undefined && cnt === 0);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [0],
        LFU: [],
        memory: [[0, 0]],
      });

      assert(cache.put(1, 1) === false);
      assert(key === undefined && val === undefined && cnt === 0);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1, 0],
        LFU: [],
        memory: [[0, 0], [1, 1]],
      });

      assert(cache.put(1, 1) === true);
      assert(key === 1 && val === 1 && cnt === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1, 0],
        LFU: [],
        memory: [[0, 0], [1, 1]],
      });

      assert(cache.get(1) === 1);
      assert(key === 1 && val === 1 && cnt === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [0],
        LFU: [1],
        memory: [[0, 0], [1, 1]],
      });

      assert(cache.put(2, 2) === false);
      assert(key === 0 && val === 0 && cnt === 2);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [2],
        LFU: [1],
        memory: [[1, 1], [2, 2]],
      });

      assert(cache.get(2) === 2);
      assert(key === 0 && val === 0 && cnt === 2);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [2, 1],
        memory: [[1, 1], [2, 2]],
      });

      assert(cache.get(2) === 2);
      assert(key === 0 && val === 0 && cnt === 2);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [2, 1],
        memory: [[1, 1], [2, 2]],
      });

      assert(cache.get(1) === 1);
      assert(key === 0 && val === 0 && cnt === 2);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [1, 2],
        memory: [[1, 1], [2, 2]],
      });

      assert(cache.put(3, 3) === false);
      assert(key === 2 && val === 2 && cnt === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [3],
        LFU: [1],
        memory: [[1, 1], [3, 3]],
      });

      assert(cache.clear() === undefined);
      assert(key === 3 && val === 3 && cnt === 5);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        memory: [],
      });
    });

    it('space', () => {
      const cache = new Cache<number, number>(3, { space: 3 });

      cache.put(0, 0);
      cache.put(1, 1);
      cache.put(2, 2, 2);
      assert(cache.length === 2);
      assert(cache.size === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [2, 1],
        LFU: [],
        memory: [[1, 1], [2, 2]],
      });

      cache.put(1, 1, 2);
      assert(cache.length === 1);
      assert(cache.size === 2);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1],
        LFU: [],
        memory: [[1, 1]],
      });

      cache.put(2, 2, 2);
      assert(cache.length === 1);
      assert(cache.size === 2);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [2],
        LFU: [],
        memory: [[2, 2]],
      });

      cache.put(3, 3);
      assert(cache.length === 2);
      assert(cache.size === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [3, 2],
        LFU: [],
        memory: [[2, 2], [3, 3]],
      });

      cache.get(3);
      assert(cache.length === 2);
      assert(cache.size === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [2],
        LFU: [3],
        memory: [[2, 2], [3, 3]],
      });

      cache.put(1, 1, 3);
      assert(cache.length === 1);
      assert(cache.size === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1],
        LFU: [],
        memory: [[1, 1]],
      });

      cache.put(1, 1);
      cache.put(2, 2, 2);
      cache.get(2);
      assert(cache.length === 2);
      assert(cache.size === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1],
        LFU: [2],
        memory: [[1, 1], [2, 2]],
      });

      cache.put(1, 1, 3);
      assert(cache.length === 1);
      assert(cache.size === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1],
        LFU: [],
        memory: [[1, 1]],
      });
    });

    it('age', async () => {
      const cache = new Cache<number, number>(1);

      cache.put(0, 0, 1, 10);
      assert(cache.has(0));
      assert(cache.get(0) === 0);
      await wait(20);
      assert(cache.has(0) === false);
      assert(cache.get(0) === undefined);

      cache.put(0, 0, 1, 10);
      assert(cache.get(0) === 0);
      assert(cache.has(0));
      await wait(20);
      assert(cache.get(0) === undefined);
      assert(cache.has(0) === false);
    });

    it('rate even 10', function () {
      this.timeout(10 * 1e3);
      this.retries(5);

      const capacity = 10;
      const lru = new LRUCache<number, number>(capacity);
      const dwc = new Cache<number, number>(capacity);

      const repeat = capacity * 2000;
      const warmup = capacity * 1000;
      let hitlru = 0;
      let hitdwc = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        const key = Math.random() * capacity * 10 | 0;
        hitlru += lru.get(key) ? 1 : +lru.set(key, i + 1) & 0;
        hitdwc += dwc.get(key) ? 1 : +dwc.put(key, i + 1);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitdwc = 0;
        }
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['memory'].size);
      assert(dwc['memory'].size <= capacity);
      console.debug('Cache even 10');
      console.debug('LRU hit rate', hitlru * 100 / repeat);
      console.debug('DWC hit rate', hitdwc * 100 / repeat);
      console.debug('DWC ratio', dwc['ratio'], dwc['indexes'].LFU.length * 100 / dwc.length | 0);
      console.debug('DWC / LRU hit rate ratio', `${hitdwc / hitlru * 100 | 0}%`);
      assert(hitdwc / hitlru * 100 > 99);
    });

    it('rate uneven 10', function () {
      this.timeout(10 * 1e3);
      this.retries(5);

      const capacity = 10;
      const lru = new LRUCache<number, number>(capacity);
      const dwc = new Cache<number, number>(capacity);

      const repeat = capacity * 2000;
      const warmup = capacity * 1000;
      let hitlru = 0;
      let hitdwc = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        const key = Math.random() < 0.4
          ? Math.random() * capacity * 1 | 0
          : Math.random() * capacity * 9 + capacity | 0;
        hitlru += lru.get(key) ? 1 : +lru.set(key, i + 1) & 0;
        hitdwc += dwc.get(key) ? 1 : +dwc.put(key, i + 1);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitdwc = 0;
        }
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['memory'].size);
      assert(dwc['memory'].size <= capacity);
      console.debug('Cache uneven 10');
      console.debug('LRU hit rate', hitlru * 100 / repeat);
      console.debug('DWC hit rate', hitdwc * 100 / repeat);
      console.debug('DWC ratio', dwc['ratio'], dwc['indexes'].LFU.length * 100 / dwc.length | 0);
      console.debug('DWC / LRU hit rate ratio', `${hitdwc / hitlru * 100 | 0}%`);
      assert(hitdwc / hitlru * 100 > 190);
    });

    it('rate even 100', function () {
      if (!navigator.userAgent.includes('Chrome')) return;
      this.timeout(10 * 1e3);
      this.retries(3);

      const capacity = 100;
      const lru = new LRUCache<number, number>(capacity);
      const dwc = new Cache<number, number>(capacity);

      const repeat = capacity * 2000;
      const warmup = capacity * 1000;
      let hitlru = 0;
      let hitdwc = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        const key = Math.random() * capacity * 10 | 0;
        hitlru += lru.get(key) ? 1 : +lru.set(key, i + 1) & 0;
        hitdwc += dwc.get(key) ? 1 : +dwc.put(key, i + 1);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitdwc = 0;
        }
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['memory'].size);
      assert(dwc['memory'].size <= capacity);
      console.debug('Cache even 100');
      console.debug('LRU hit rate', hitlru * 100 / repeat);
      console.debug('DWC hit rate', hitdwc * 100 / repeat);
      console.debug('DWC ratio', dwc['ratio'], dwc['indexes'].LFU.length * 100 / dwc.length | 0);
      console.debug('DWC / LRU hit rate ratio', `${hitdwc / hitlru * 100 | 0}%`);
      assert(hitdwc / hitlru * 100 > 99);
    });

    it('rate uneven 100', function () {
      if (!navigator.userAgent.includes('Chrome')) return;
      this.timeout(10 * 1e3);
      this.retries(3);

      const capacity = 100;
      const lru = new LRUCache<number, number>(capacity);
      const dwc = new Cache<number, number>(capacity);

      const repeat = capacity * 2000;
      const warmup = capacity * 1000;
      let hitlru = 0;
      let hitdwc = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        // DWCは静的な偏りの抽出能力が高いだけのようだが偏りがない場合でもLRUとほぼ遜色ない
        const key = Math.random() < 0.4
          ? Math.random() * capacity * 1 | 0
          : Math.random() * capacity * 9 + capacity | 0;
        hitlru += lru.get(key) ? 1 : +lru.set(key, i + 1) & 0;
        hitdwc += dwc.get(key) ? 1 : +dwc.put(key, i + 1);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitdwc = 0;
        }
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['memory'].size);
      assert(dwc['memory'].size <= capacity);
      console.debug('Cache uneven 100');
      console.debug('LRU hit rate', hitlru * 100 / repeat);
      console.debug('DWC hit rate', hitdwc * 100 / repeat);
      console.debug('DWC ratio', dwc['ratio'], dwc['indexes'].LFU.length * 100 / dwc.length | 0);
      console.debug('DWC / LRU hit rate ratio', `${hitdwc / hitlru * 100 | 0}%`);
      assert(hitdwc / hitlru * 100 > 200);
    });

    it('rate uneven 100 transitive distribution', function () {
      if (!navigator.userAgent.includes('Chrome')) return;
      this.timeout(10 * 1e3);
      this.retries(3);

      const capacity = 100;
      const lru = new LRUCache<number, number>(capacity);
      const dwc = new Cache<number, number>(capacity);

      const repeat = capacity * 2000;
      const warmup = capacity * 1000;
      let hitlru = 0;
      let hitdwc = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        const key = Math.random() < 0.4
          ? Math.random() * capacity * 1 | 0
          // DWCは推移的な分散には影響されない
          : Math.random() * capacity * 9 + i * capacity / 100 + capacity | 0;
        hitlru += lru.get(key) ? 1 : +lru.set(key, i + 1) & 0;
        hitdwc += dwc.get(key) ? 1 : +dwc.put(key, i + 1);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitdwc = 0;
        }
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['memory'].size);
      assert(dwc['memory'].size <= capacity);
      console.debug('Cache uneven 100 transitive distribution');
      console.debug('LRU hit rate', hitlru * 100 / repeat);
      console.debug('DWC hit rate', hitdwc * 100 / repeat);
      console.debug('DWC ratio', dwc['ratio'], dwc['indexes'].LFU.length * 100 / dwc.length | 0);
      console.debug('DWC / LRU hit rate ratio', `${hitdwc / hitlru * 100 | 0}%`);
      assert(hitdwc / hitlru * 100 > 200);
    });

    it('rate uneven 100 transitive bias', function () {
      if (!navigator.userAgent.includes('Chrome')) return;
      this.timeout(10 * 1e3);
      this.retries(3);

      const capacity = 100;
      const lru = new LRUCache<number, number>(capacity);
      const dwc = new Cache<number, number>(capacity);

      const repeat = capacity * 2000;
      const warmup = capacity * 1000;
      let hitlru = 0;
      let hitdwc = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        const key = Math.random() < 0.4
          // DWCは推移的な偏りでやや精度低下する
          // 偏りの抽出が分布全体の推移により無効化され逆効果になるからであろう
          // 偏りの抽出によりLRUより精度を上げようとするキャッシュアルゴリズム全般のトレードオフと思われる
          // 単純に大きな分布なら問題ないが大きな分布の中で局所性の変化による疑似的な推移が生じる可能性はある
          // しかし推移により常に抽出を無効化し続ける状況は通常のアクセスパターンからは考えにくく
          // そのような状況が生じるならキャッシュサイズが小さすぎることに問題があることのほうが多いだろう
          ? Math.random() * capacity * 1 - i * capacity / 100 | 0
          : Math.random() * capacity * 9 + capacity | 0;
        hitlru += lru.get(key) ? 1 : +lru.set(key, i + 1) & 0;
        hitdwc += dwc.get(key) ? 1 : +dwc.put(key, i + 1);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitdwc = 0;
        }
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['memory'].size);
      assert(dwc['memory'].size <= capacity);
      console.debug('Cache uneven 100 transitive bias');
      console.debug('LRU hit rate', hitlru * 100 / repeat);
      console.debug('DWC hit rate', hitdwc * 100 / repeat);
      console.debug('DWC ratio', dwc['ratio'], dwc['indexes'].LFU.length * 100 / dwc.length | 0);
      console.debug('DWC / LRU hit rate ratio', `${hitdwc / hitlru * 100 | 0}%`);
      assert(hitdwc / hitlru * 100 > 95);
    });

    it('rate uneven 100 sequential', function () {
      if (!navigator.userAgent.includes('Chrome')) return;
      this.timeout(10 * 1e3);
      this.retries(3);

      const capacity = 100;
      const lru = new LRUCache<number, number>(capacity);
      const dwc = new Cache<number, number>(capacity);

      const repeat = capacity * 2000;
      const warmup = capacity * 1000;
      let hitlru = 0;
      let hitdwc = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        const key = Math.random() < 0.4
          ? Math.random() * capacity * 1 | 0
          : capacity + i % (capacity * 10);
        hitlru += lru.get(key) ? 1 : +lru.set(key, i + 1) & 0;
        hitdwc += dwc.get(key) ? 1 : +dwc.put(key, i + 1);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitdwc = 0;
        }
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['memory'].size);
      assert(dwc['memory'].size <= capacity);
      console.debug('Cache uneven 100 sequential');
      console.debug('LRU hit rate', hitlru * 100 / repeat);
      console.debug('DWC hit rate', hitdwc * 100 / repeat);
      console.debug('DWC ratio', dwc['ratio'], dwc['indexes'].LFU.length * 100 / dwc.length | 0);
      console.debug('DWC / LRU hit rate ratio', `${hitdwc / hitlru * 100 | 0}%`);
      assert(hitdwc / hitlru * 100 > 270);
    });

    it('rate uneven 100 adversarial', function () {
      if (!navigator.userAgent.includes('Chrome')) return;
      this.timeout(10 * 1e3);
      this.retries(3);

      const capacity = 100;
      const lru = new LRUCache<number, number>(capacity);
      const dwc = new Cache<number, number>(capacity);

      const repeat = capacity * 2000;
      const warmup = capacity * 1000;
      let hitlru = 0;
      let hitdwc = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        const key = Math.random() < 0.1
          ? Math.random() * capacity * 1 | 0
          : capacity + i >> 1 << 1;
        hitlru += lru.get(key) ? 1 : +lru.set(key, i + 1) & 0;
        hitdwc += dwc.get(key) ? 1 : +dwc.put(key, i + 1);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitdwc = 0;
        }
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['memory'].size);
      assert(dwc['memory'].size <= capacity);
      console.debug('Cache uneven 100 adversarial');
      console.debug('LRU hit rate', hitlru * 100 / repeat);
      console.debug('DWC hit rate', hitdwc * 100 / repeat);
      console.debug('DWC ratio', dwc['ratio'], dwc['indexes'].LFU.length * 100 / dwc.length | 0);
      console.debug('DWC / LRU hit rate ratio', `${hitdwc / hitlru * 100 | 0}%`);
      assert(hitdwc / hitlru * 100 > 100);
    });

    it('rate uneven 1,000', function () {
      if (!navigator.userAgent.includes('Chrome')) return;
      this.timeout(30 * 1e3);
      this.retries(3);

      const capacity = 1000;
      const lru = new LRUCache<number, number>(capacity);
      const dwc = new Cache<number, number>(capacity);

      const repeat = capacity * 1000;
      const warmup = capacity * 1000;
      let hitlru = 0;
      let hitdwc = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        const key = Math.random() < 0.4
          ? Math.random() * capacity * 1 | 0
          : Math.random() * capacity * 9 + capacity | 0;
        hitlru += lru.get(key) ? 1 : +lru.set(key, i + 1) & 0;
        hitdwc += dwc.get(key) ? 1 : +dwc.put(key, i + 1);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitdwc = 0;
        }
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['memory'].size);
      assert(dwc['memory'].size <= capacity);
      console.debug('Cache uneven 1,000');
      console.debug('LRU hit rate', hitlru * 100 / repeat);
      console.debug('DWC hit rate', hitdwc * 100 / repeat);
      console.debug('DWC ratio', dwc['ratio'], dwc['indexes'].LFU.length * 100 / dwc.length | 0);
      console.debug('DWC / LRU hit rate ratio', `${hitdwc / hitlru * 100 | 0}%`);
      assert(hitdwc / hitlru * 100 > 200);
    });

  });

});
