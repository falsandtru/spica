import { Cache } from './cache';
import LRUCache from 'lru-cache';
import { wait } from './timer';
import { pcg32 } from './random';

describe('Unit: lib/cache', () => {
  describe('Cache', () => {
    function inspect<K, V>(cache: Cache<K, V>) {
      return {
        LRU: [...cache['indexes'].LRU].map(i => i.key),
        LFU: [...cache['indexes'].LFU].map(i => i.key),
        memory: [...cache['memory']].map(([key, { value: { value } }]) => [key, value]),
      };
    }

    it('put/has/delete 1', () => {
      const cache = new Cache<number, number>(1, { test: true });

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
      const cache = new Cache<number, number>(2, { test: true, disposer: (v, k) => (key = k, val = v, ++cnt) });

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

    it('size', () => {
      const cache = new Cache<number, number>(3, { test: true });

      cache.put(0, 0);
      cache.put(1, 1);
      cache.put(2, 2, { size: 2 });
      assert(cache.length === 2);
      assert(cache.size === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [2, 1],
        LFU: [],
        memory: [[1, 1], [2, 2]],
      });

      cache.put(1, 1, { size: 2 });
      assert(cache.length === 1);
      assert(cache.size === 2);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1],
        LFU: [],
        memory: [[1, 1]],
      });

      cache.put(2, 2, { size: 2 });
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

      cache.put(1, 1, { size: 3 });
      assert(cache.length === 1);
      assert(cache.size === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1],
        LFU: [],
        memory: [[1, 1]],
      });

      cache.put(1, 1);
      cache.put(2, 2, { size: 2 });
      cache.get(2);
      assert(cache.length === 2);
      assert(cache.size === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1],
        LFU: [2],
        memory: [[1, 1], [2, 2]],
      });

      cache.put(1, 1, { size: 3 });
      assert(cache.length === 1);
      assert(cache.size === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1],
        LFU: [],
        memory: [[1, 1]],
      });
    });

    it('resize', () => {
      const cache = new Cache<number>(2, { test: true });

      cache.put(0);
      cache.put(1);
      cache.resize(3);
      cache.put(2);
      assert(cache.length === 3);
      assert(cache.size === 3);
      cache.resize(2);
      assert(cache.length === 2);
      assert(cache.size === 2);
      cache.resize(4);
      assert(cache.length === 2);
      assert(cache.size === 2);
    });

    it('age', async () => {
      const cache = new Cache<number, number>(3, { test: true });

      cache.put(0, 0, { age: 10 });
      assert(cache.has(0));
      assert(cache.get(0) === 0);
      await wait(20);
      assert(cache.has(0) === false);
      assert(cache.get(0) === undefined);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        memory: [],
      });

      cache.put(0, 0, { age: 10 });
      assert(cache.get(0) === 0);
      assert(cache.has(0));
      await wait(20);
      assert(cache.get(0) === undefined);
      assert(cache.has(0) === false);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        memory: [],
      });
    });

    it('age early', async () => {
      const cache = new Cache<number, number>(3, { test: true, earlyExpiring: true });

      cache.put(0, 0, { age: 10 });
      cache.put(1, 1, { age: 5 });
      cache.put(2, 2, { age: 10 });
      await wait(20);
      assert(cache.length === 3);
      cache.put(3, 3);
      assert(cache.length === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [3, 2, 0],
        LFU: [],
        memory: [[0, 0], [2, 2], [3, 3]],
      });
    });

    it('rate even 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRUCache<number, 1>({ max: capacity });
      const dwc = new Cache<number, 1>(capacity);

      const repeat = capacity * 1000;
      const random = pcg32.random(pcg32.seed(0n, 0n));
      let lruhit = 0;
      let dwchit = 0;
      for (let i = 0; i < repeat; ++i) {
        const key = random() * capacity * 10 | 0;
        lruhit += lru.get(key) ?? +lru.set(key, 1) & 0;
        dwchit += dwc.get(key) ?? +dwc.put(key, 1) & 0;
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['memory'].size);
      assert(dwc['memory'].size <= capacity);
      console.debug('Cache even 100');
      console.debug('LRU hit rate', lruhit * 100 / repeat);
      console.debug('DWC hit rate', dwchit * 100 / repeat);
      console.debug('DWC ratio', dwc['ratio'] / 10 | 0, dwc['indexes'].LFU.length * 100 / dwc.length | 0);
      console.debug('DWC / LRU hit rate ratio', `${dwchit / lruhit * 100 | 0}%`);
      assert(dwchit / lruhit * 100 >>> 0 === 100);
    });

    it('rate uneven 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRUCache<number, 1>({ max: capacity });
      const dwc = new Cache<number, 1>(capacity);

      const repeat = capacity * 1000;
      const random = pcg32.random(pcg32.seed(0n, 0n));
      let lruhit = 0;
      let dwchit = 0;
      for (let i = 0; i < repeat; ++i) {
        const key = random() < 0.4
          // 静的偏りは小さなLRUでもLFUに蓄積できる
          ? random() * capacity * -1 | 0
          : random() * capacity * 10 | 0;
        lruhit += lru.get(key) ?? +lru.set(key, 1) & 0;
        dwchit += dwc.get(key) ?? +dwc.put(key, 1) & 0;
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['memory'].size);
      assert(dwc['memory'].size <= capacity);
      console.debug('Cache uneven 100');
      console.debug('LRU hit rate', lruhit * 100 / repeat);
      console.debug('DWC hit rate', dwchit * 100 / repeat);
      console.debug('DWC ratio', dwc['ratio'] / 10 | 0, dwc['indexes'].LFU.length * 100 / dwc.length | 0);
      console.debug('DWC / LRU hit rate ratio', `${dwchit / lruhit * 100 | 0}%`);
      assert(dwchit / lruhit * 100 >>> 0 === 191);
    });

    it('rate uneven 100 transitive distribution', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRUCache<number, 1>({ max: capacity });
      const dwc = new Cache<number, 1>(capacity);

      const repeat = capacity * 1000;
      const random = pcg32.random(pcg32.seed(0n, 0n));
      let lruhit = 0;
      let dwchit = 0;
      for (let i = 0; i < repeat; ++i) {
        const key = random() < 0.4
          ? random() * capacity * -1 | 0
          : random() * capacity * 10 + i * capacity / 100 | 0;
        lruhit += lru.get(key) ?? +lru.set(key, 1) & 0;
        dwchit += dwc.get(key) ?? +dwc.put(key, 1) & 0;
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['memory'].size);
      assert(dwc['memory'].size <= capacity);
      console.debug('Cache uneven 100 transitive distribution');
      console.debug('LRU hit rate', lruhit * 100 / repeat);
      console.debug('DWC hit rate', dwchit * 100 / repeat);
      console.debug('DWC ratio', dwc['ratio'] / 10 | 0, dwc['indexes'].LFU.length * 100 / dwc.length | 0);
      console.debug('DWC / LRU hit rate ratio', `${dwchit / lruhit * 100 | 0}%`);
      assert(dwchit / lruhit * 100 >>> 0 === 195);
    });

    it('rate uneven 100 transitive bias', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRUCache<number, 1>({ max: capacity });
      const dwc = new Cache<number, 1>(capacity);

      const repeat = capacity * 1000;
      const random = pcg32.random(pcg32.seed(0n, 0n));
      let lruhit = 0;
      let dwchit = 0;
      for (let i = 0; i < repeat; ++i) {
        const key = random() < 0.5
          // LFUが機能するアクセスパターンの場合はLRUだけでも同等に効果的に動作し機能しない場合もLRUに縮退して同等
          // 推移的偏りはこれを迅速に捕捉し続けるLRUと保持するLFUが必要であるため偏りの2倍の容量が必要となる
          //? random() * capacity * -1 - i / 2 * capacity / 100 | 0
          ? random() * capacity / -4 - i / 2 * capacity / 400 | 0
          : random() * capacity * 10 | 0;
        lruhit += lru.get(key) ?? +lru.set(key, 1) & 0;
        dwchit += dwc.get(key) ?? +dwc.put(key, 1) & 0;
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['memory'].size);
      assert(dwc['memory'].size <= capacity);
      console.debug('Cache uneven 100 transitive bias');
      console.debug('LRU hit rate', lruhit * 100 / repeat);
      console.debug('DWC hit rate', dwchit * 100 / repeat);
      console.debug('DWC ratio', dwc['ratio'] / 10 | 0, dwc['indexes'].LFU.length * 100 / dwc.length | 0);
      console.debug('DWC / LRU hit rate ratio', `${dwchit / lruhit * 100 | 0}%`);
      assert(dwchit / lruhit * 100 >>> 0 === 88);
    });

    it('rate uneven 100 sequential', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRUCache<number, 1>({ max: capacity });
      const dwc = new Cache<number, 1>(capacity);

      const repeat = capacity * 1000;
      const random = pcg32.random(pcg32.seed(0n, 0n));
      let lruhit = 0;
      let dwchit = 0;
      for (let i = 0; i < repeat; ++i) {
        const key = random() < 0.4
          ? random() * capacity * -1 | 0
          // LRU破壊
          : i;
        lruhit += lru.get(key) ?? +lru.set(key, 1) & 0;
        dwchit += dwc.get(key) ?? +dwc.put(key, 1) & 0;
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['memory'].size);
      assert(dwc['memory'].size <= capacity);
      console.debug('Cache uneven 100 sequential');
      console.debug('LRU hit rate', lruhit * 100 / repeat);
      console.debug('DWC hit rate', dwchit * 100 / repeat);
      console.debug('DWC ratio', dwc['ratio'] / 10 | 0, dwc['indexes'].LFU.length * 100 / dwc.length | 0);
      console.debug('DWC / LRU hit rate ratio', `${dwchit / lruhit * 100 | 0}%`);
      assert(dwchit / lruhit * 100 >>> 0 === 262);
    });

    it('rate uneven 100 adversarial', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRUCache<number, 1>({ max: capacity });
      const dwc = new Cache<number, 1>(capacity);

      const repeat = capacity * 1000;
      const random = pcg32.random(pcg32.seed(0n, 0n));
      let lruhit = 0;
      let dwchit = 0;
      for (let i = 0; i < repeat; ++i) {
        const key = i % 3
          // LFU破壊
          ? i % 3 - 1 ? i - i % 3 + 48 : i - i % 3
          : random() * capacity / -6 | 0;
        lruhit += lru.get(key)! & +(key < 0) || +lru.set(key, 1) & 0;
        dwchit += dwc.get(key)! & +(key < 0) || +dwc.put(key, 1) & 0;
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['memory'].size);
      assert(dwc['memory'].size <= capacity);
      console.debug('Cache uneven 100 adversarial');
      console.debug('LRU hit rate', lruhit * 100 / repeat);
      console.debug('DWC hit rate', dwchit * 100 / repeat);
      console.debug('DWC ratio', dwc['ratio'] / 10 | 0, dwc['indexes'].LFU.length * 100 / dwc.length | 0);
      console.debug('DWC / LRU hit rate ratio', `${dwchit / lruhit * 100 | 0}%`);
      assert(dwchit / lruhit * 100 >>> 0 === 99);
    });

    if (!navigator.userAgent.includes('Chrome')) return;

    it('rate uneven 1,000', function () {
      this.timeout(60 * 1e3);

      const capacity = 1000;
      const lru = new LRUCache<number, 1>({ max: capacity });
      const dwc = new Cache<number, 1>(capacity);

      const repeat = capacity * 1000;
      const random = pcg32.random(pcg32.seed(0n, 0n));
      let lruhit = 0;
      let dwchit = 0;
      for (let i = 0; i < repeat; ++i) {
        const key = random() < 0.4
          ? random() * capacity * -1 | 0
          : random() * capacity * 10 | 0;
        lruhit += lru.get(key) ?? +lru.set(key, 1) & 0;
        dwchit += dwc.get(key) ?? +dwc.put(key, 1) & 0;
      }
      assert(dwc['indexes'].LRU.length + dwc['indexes'].LFU.length === dwc['memory'].size);
      assert(dwc['memory'].size <= capacity);
      console.debug('Cache uneven 1,000');
      console.debug('LRU hit rate', lruhit * 100 / repeat);
      console.debug('DWC hit rate', dwchit * 100 / repeat);
      console.debug('DWC ratio', dwc['ratio'] / 10 | 0, dwc['indexes'].LFU.length * 100 / dwc.length | 0);
      console.debug('DWC / LRU hit rate ratio', `${dwchit / lruhit * 100 | 0}%`);
      assert(dwchit / lruhit * 100 >>> 0 === 197);
    });

  });

});
