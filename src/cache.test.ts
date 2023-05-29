import { Cache } from './cache';
import { LRU } from './lru';
import { wait } from './timer';
import { xorshift } from './random';
import zipfian from 'zipfian-integer';

describe('Unit: lib/cache', () => {
  describe('Cache', () => {
    function inspect<K, V>(cache: Cache<K, V>) {
      return {
        LRU: [...cache['LRU']].map(i => i.key),
        LFU: [...cache['LFU']].map(i => i.key),
        dict: [...cache['dict']].map(([key, { value }]) => [key, value]),
      };
    }

    it('put/has/delete 1', () => {
      const cache = new Cache<number, number>(1, { sweep: { threshold: 0 } });

      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        dict: [],
      });

      assert(cache.has(0) === false);
      assert(cache.get(0) === undefined);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        dict: [],
      });

      assert(cache.has(0) === false);
      assert(cache.put(0, 0) === false);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [0],
        LFU: [],
        dict: [[0, 0]],
      });

      assert(cache.has(0) === true);
      assert(cache.put(0, 1) === true);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [0],
        LFU: [],
        dict: [[0, 1]],
      });

      assert(cache.has(0) === true);
      assert(cache.delete(0) === true);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        dict: [],
      });

      assert(cache.delete(0) === false);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        dict: [],
      });
    });

    it('put/has/delete 3', () => {
      let key: number | undefined;
      let val: number | undefined;
      let cnt = 0;
      const cache = new Cache<number, number>(3, { sweep: { threshold: 0 }, disposer: (v, k) => (key = k, val = v, ++cnt) });

      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        dict: [],
      });

      assert(cache.put(0, 0) === false);
      assert(key === undefined && val === undefined && cnt === 0);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [0],
        LFU: [],
        dict: [[0, 0]],
      });

      assert(cache.put(1, 1) === false);
      assert(key === undefined && val === undefined && cnt === 0);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1, 0],
        LFU: [],
        dict: [[0, 0], [1, 1]],
      });

      assert(cache.put(1, 1) === true);
      assert(key === 1 && val === 1 && cnt === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1, 0],
        LFU: [],
        dict: [[0, 0], [1, 1]],
      });

      assert(cache.get(0) === 0);
      assert(key === 1 && val === 1 && cnt === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1],
        LFU: [0],
        dict: [[0, 0], [1, 1]],
      });

      assert(cache.put(2, 2) === false);
      assert(key === 1 && val === 1 && cnt === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [2, 1],
        LFU: [0],
        dict: [[0, 0], [1, 1], [2, 2]],
      });

      assert(cache.get(1) === 1);
      assert(key === 1 && val === 1 && cnt === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [2],
        LFU: [1, 0],
        dict: [[0, 0], [1, 1], [2, 2]],
      });

      assert(cache.get(0) === 0);
      assert(key === 1 && val === 1 && cnt === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [2],
        LFU: [0, 1],
        dict: [[0, 0], [1, 1], [2, 2]],
      });

      assert(cache.put(3, 3) === false);
      assert(key === 1 && val === 1 && cnt === 2);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [3],
        LFU: [2, 0],
        dict: [[0, 0], [2, 2], [3, 3]],
      });

      assert(cache.clear() === undefined);
      assert(key === 0 && val === 0 && cnt === 5);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        dict: [],
      });
    });

    it('size', () => {
      const cache = new Cache<number, number>(3, { sweep: { threshold: 0 } });

      cache.put(0, 0);
      cache.put(1, 1, { size: 2 });
      assert(cache.length === 2);
      assert(cache.size === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1, 0],
        LFU: [],
        dict: [[0, 0], [1, 1]],
      });

      cache.put(0, 0, { size: 2 });
      assert(cache.length === 1);
      assert(cache.size === 2);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [0],
        dict: [[0, 0]],
      });

      cache.put(2, 2, { size: 2 });
      assert(cache.length === 1);
      assert(cache.size === 2);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [2],
        LFU: [],
        dict: [[2, 2]],
      });

      cache.put(3, 3);
      assert(cache.length === 2);
      assert(cache.size === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [3, 2],
        LFU: [],
        dict: [[2, 2], [3, 3]],
      });

      cache.get(2);
      assert(cache.length === 2);
      assert(cache.size === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [3],
        LFU: [2],
        dict: [[2, 2], [3, 3]],
      });

      cache.put(1, 1, { size: 3 });
      assert(cache.length === 1);
      assert(cache.size === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1],
        LFU: [],
        dict: [[1, 1]],
      });

      cache.put(1, 1, { size: 2 });
      cache.put(2, 2);
      cache.get(1);
      assert(cache.length === 2);
      assert(cache.size === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [2],
        LFU: [1],
        dict: [[1, 1], [2, 2]],
      });

      cache.put(2, 2, { size: 3 });
      assert(cache.length === 1);
      assert(cache.size === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [2],
        LFU: [],
        dict: [[2, 2]],
      });
    });

    it('resize', () => {
      const cache = new Cache<number, undefined>(2, { sweep: { threshold: 0 } });

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
      const cache = new Cache<number, number>(3, { age: Infinity, sweep: { threshold: 0 } });

      cache.put(0, 0, { age: 10 });
      assert(cache.has(0));
      assert(cache.get(0) === 0);
      await wait(20);
      assert(cache.has(0) === false);
      assert(cache.get(0) === undefined);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        dict: [],
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
        dict: [],
      });
    });

    it('age eager', async () => {
      const cache = new Cache<number, number>(3, { age: Infinity, eagerExpiration: true, sweep: { threshold: 0 } });

      cache.put(0, 0, { age: 50 });
      cache.put(1, 1, { age: 1 });
      cache.put(2, 2, { age: 50 });
      await wait(100);
      assert(cache.length === 3);
      cache.put(3, 3);
      assert(cache.length === 3);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [3, 2, 0],
        LFU: [],
        dict: [[0, 0], [2, 2], [3, 3]],
      });
    });

    it('sweep', function () {
      const cache = new Cache<number, number>(100);

      for (let i = 0; i < 1000; ++i) {
        cache.get(i) ?? cache.put(i, i);
      }
      assert(cache.has(1));
      assert(cache.has(0));
      assert(!cache.has(100 - 1));
      assert(!cache.has(100));
      assert(!cache.has(100 + 1));
      assert(!cache.has(197 - 1));
      assert(cache.has(197));
      assert(!cache.has(197 + 1));
      assert(!cache.has(297 - 1));
      assert(cache.has(297));
      assert(!cache.has(297 + 1));
    });

    it('verify', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const cache = new Cache<number, number>(capacity);

      const trials = capacity * 1000;
      const random = xorshift.random(1);
      for (let i = 0; i < trials; ++i) {
        const key = random() * capacity * 10 | 0;
        if (cache.has(key)) {
          assert(cache.get(key) === ~key);
        }
        else {
          cache.add(key, ~key);
        }
      }
      assert(cache.length === capacity);
    });

    if (!navigator.userAgent.includes('Chrome')) return;

    class Stats {
      lru = 0;
      dwc = 0;
    }

    it('ratio zipf 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 1000;
      const random = zipfian(1, capacity * 1e3, 0.8, xorshift.random(1));
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random();
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache zipf 100');
      console.debug('LRU hit ratio', stats.lru * 100 / trials);
      console.debug('DWC hit ratio', stats.dwc * 100 / trials);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 205);
    });

    it('ratio even 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 1000;
      const random = xorshift.random(1);
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random() * capacity * 10 | 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache even 100');
      console.debug('LRU hit ratio', stats.lru * 100 / trials);
      console.debug('DWC hit ratio', stats.dwc * 100 / trials);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 99);
    });

    it('ratio uneven 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 1000;
      const random = xorshift.random(1);
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random() < 0.4
          ? random() * capacity * -1 | 0
          : random() * capacity * 10 | 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache uneven 100');
      console.debug('LRU hit ratio', stats.lru * 100 / trials);
      console.debug('DWC hit ratio', stats.dwc * 100 / trials);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 154);
    });

    it('ratio uneven 100 transitive distribution', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 1000;
      const random = xorshift.random(1);
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random() < 0.4
          ? random() * capacity * -1 | 0
          : random() * capacity * 10 + i * capacity / 100 | 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache uneven 100 transitive distribution');
      console.debug('LRU hit ratio', stats.lru * 100 / trials);
      console.debug('DWC hit ratio', stats.dwc * 100 / trials);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 162);
    });

    it('ratio uneven 100 transitive bias', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 1000;
      const random = xorshift.random(1);
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random() < 0.5
          // 推移的偏りはこれを迅速に捕捉し続けるLRUと保持するLFUが必要であるため偏りの2倍の履歴が必要となる
          //? random() * capacity * -1 - i / 2 * capacity / 100 | 0
          ? random() * capacity / -4 - i / 2 * capacity / 400 | 0
          : random() * capacity * 10 | 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache uneven 100 transitive bias');
      console.debug('LRU hit ratio', stats.lru * 100 / trials);
      console.debug('DWC hit ratio', stats.dwc * 100 / trials);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 62);
    });

    it('ratio uneven 100 sequential', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 1000;
      const random = xorshift.random(1);
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random() < 0.4
          ? random() * capacity * -1 | 0
          // LRU汚染
          : i;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache uneven 100 sequential');
      console.debug('LRU hit ratio', stats.lru * 100 / trials);
      console.debug('DWC hit ratio', stats.dwc * 100 / trials);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 237);
    });

    it('ratio uneven 100 adversarial', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 1000;
      const random = xorshift.random(1);
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = i % 3
          // LFU汚染
          ? i % 3 - 1 ? i - i % 3 + 6 : i - i % 3
          : random() * capacity / -1 | 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache uneven 100 adversarial');
      console.debug('LRU hit ratio', stats.lru * 100 / trials);
      console.debug('DWC hit ratio', stats.dwc * 100 / trials);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 78);
    });

    it('ratio uneven 100 jump', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 1000;
      const random = xorshift.random(1);
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        // スキャン耐性が逆効果となる一度限りのアクセス
        const key = random() * capacity + (i / capacity | 0) * capacity | 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache uneven 100 jump');
      console.debug('LRU hit ratio', stats.lru * 100 / trials);
      console.debug('DWC hit ratio', stats.dwc * 100 / trials);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 11);
    });

    it('ratio uneven 100 loop', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 1000;
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = i % (capacity * 2);
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache uneven 100 loop');
      console.debug('LRU hit ratio', stats.lru * 100 / trials);
      console.debug('DWC hit ratio', stats.dwc * 100 / trials);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 === Infinity);
      assert(stats.dwc * 100 / trials >>> 0 === 39);
    });

    it('ratio uneven 100 lock loop', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 20;
      const stats = new Stats();
      // 統計汚染
      for (let i = 0; i < capacity * 100; ++i) {
        lru.set(Number.MIN_SAFE_INTEGER + i, 1);
        dwc.set(Number.MIN_SAFE_INTEGER + i, 1);
        if (i + 1 === capacity) for (const { key } of [...dwc['LRU']].slice(dwc['window'])) {
          dwc.get(key);
        }
      }
      assert(dwc['LFU'].length === capacity - dwc['window']);
      assert(dwc['partition'] === capacity - dwc['window']);
      assert(dwc['declination'] === 5);
      dwc['injection'] = 0;
      for (let i = 0; i < trials; ++i) {
        const key = i % (capacity * 2);
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
        if (trials - i - 1 !== trials / 2) continue;
        stats.lru = 0;
        stats.dwc = 0;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache uneven 100 lock loop');
      console.debug('LRU hit ratio', stats.lru * 100 / trials / 2);
      console.debug('DWC hit ratio', stats.dwc * 100 / trials / 2);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 === Infinity);
      assert(stats.dwc * 100 / trials / 2 >>> 0 === 8);
      assert(dwc['partition']! * 100 / capacity >>> 0 === 66);
    });

    it('ratio uneven 100 lock LIR', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 20;
      const random = xorshift.random(1);
      const stats = new Stats();
      // 統計汚染
      for (let i = 0; i < capacity * 100; ++i) {
        lru.set(Number.MIN_SAFE_INTEGER + i, 1);
        dwc.set(Number.MIN_SAFE_INTEGER + i, 1);
        if (i + 1 === capacity) for (const { key } of [...dwc['LRU']].slice(dwc['window'])) {
          dwc.get(key);
        }
      }
      assert(dwc['LFU'].length === capacity - dwc['window']);
      assert(dwc['partition'] === capacity - dwc['window']);
      assert(dwc['declination'] === 5);
      dwc['injection'] = 0;
      for (let i = 0; i < trials; ++i) {
        const key = random() < 0.5
          ? random() * capacity * -1 | 0
          : random() * capacity * 4 | 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
        if (trials - i - 1 !== trials / 2) continue;
        stats.lru = 0;
        stats.dwc = 0;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache uneven 100 lock LIR');
      console.debug('LRU hit ratio', stats.lru * 100 / trials / 2);
      console.debug('DWC hit ratio', stats.dwc * 100 / trials / 2);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 70);
      assert(dwc['partition']! * 100 / capacity >>> 0 === 52);
    });

    it('ratio uneven 100 lock HIR', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 20;
      const random = xorshift.random(1);
      const stats = new Stats();
      // 統計汚染
      for (let i = 0; i < capacity * 100; ++i) {
        lru.set(Number.MIN_SAFE_INTEGER + i, 1);
        dwc.set(Number.MIN_SAFE_INTEGER + i, 1);
        if (i + 1 === capacity) for (const { key } of [...dwc['LRU']].slice(dwc['window'])) {
          dwc.get(key);
        }
      }
      assert(dwc['LFU'].length === capacity - dwc['window']);
      assert(dwc['partition'] === capacity - dwc['window']);
      assert(dwc['declination'] === 5);
      dwc['injection'] = 0;
      for (let i = 0; i < trials; ++i) {
        const key = i % 2
          ? -i % capacity / 2 | 0
          : random() * capacity * 2 | 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
        if (trials - i - 1 !== trials / 2) continue;
        stats.lru = 0;
        stats.dwc = 0;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache uneven 100 lock HIR');
      console.debug('LRU hit ratio', stats.lru * 100 / trials / 2);
      console.debug('DWC hit ratio', stats.dwc * 100 / trials / 2);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 91);
      assert(dwc['partition']! * 100 / capacity >>> 0 === 61);
    });

    it('ratio uneven 1,000', function () {
      this.timeout(60 * 1e3);

      const capacity = 1000;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 1000;
      const random = xorshift.random(1);
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random() < 0.4
          ? random() * capacity * -1 | 0
          : random() * capacity * 10 | 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache uneven 1,000');
      console.debug('LRU hit ratio', stats.lru * 100 / trials);
      console.debug('DWC hit ratio', stats.dwc * 100 / trials);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 161);
    });

  });

});
