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
      assert(!cache.has(194 - 1));
      assert(cache.has(194));
      assert(!cache.has(194 + 1));
      assert(!cache.has(298 - 1));
      assert(cache.has(298));
      assert(!cache.has(298 + 1));
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
      total = 0;
      lru = 0;
      dwc = 0;
      clear() {
        this.total = 0;
        this.lru = 0;
        this.dwc = 0;
      }
    }

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
        stats.total += 1;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache even 100');
      console.debug('LRU hit ratio', stats.lru * 100 / stats.total);
      console.debug('DWC hit ratio', stats.dwc * 100 / stats.total);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 100);
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
          ? random() * capacity * -1 - 1 | 0
          : random() * capacity * 10 | 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
        stats.total += 1;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache uneven 100');
      console.debug('LRU hit ratio', stats.lru * 100 / stats.total);
      console.debug('DWC hit ratio', stats.dwc * 100 / stats.total);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 146);
    });

    it('ratio zipf 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 1000;
      const zipf = zipfian(1, capacity * 1e2, 0.8, xorshift.random(1));
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = zipf();
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
        stats.total += 1;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache zipf 100');
      console.debug('LRU hit ratio', stats.lru * 100 / stats.total);
      console.debug('DWC hit ratio', stats.dwc * 100 / stats.total);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 155);
    });

    it('ratio transitive distribution 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 1000;
      const zipf = zipfian(1, capacity * 1e2, 0.8, xorshift.random(1));
      const random = xorshift.random(1);
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = i % 2
          ? zipf()
          : -random() * capacity * 10 - (i / 2 | 0) * capacity / 100 / 10 | 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
        stats.total += 1;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache transitive distribution 100');
      console.debug('LRU hit ratio', stats.lru * 100 / stats.total);
      console.debug('DWC hit ratio', stats.dwc * 100 / stats.total);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 133);
    });

    it('ratio transitive bias 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 1000;
      const zipf = zipfian(1, capacity * 1e2, 0.8, xorshift.random(1));
      const random = xorshift.random(1);
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = i % 2
          // 推移的偏りはこれを迅速に捕捉し続けるLRUと保持するLFUが必要であるため偏りの2倍の履歴が必要となる
          ? capacity * 1e2 - zipf() + (i / 2 | 0) * capacity / 100 / 10 | 0
          : -random() * capacity * 10 - 1 | 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
        stats.total += 1;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache transitive bias 100');
      console.debug('LRU hit ratio', stats.lru * 100 / stats.total);
      console.debug('DWC hit ratio', stats.dwc * 100 / stats.total);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 68);
    });

    it('ratio adversarial 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 100;
      const zipf = zipfian(1, capacity * 1e2, 0.8, xorshift.random(1));
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = i % 3
          // LFU汚染
          // 容量1000でほぼ完全に相殺
          ? i % 3 - 2 ? i - i % 3 : i - i % 3 + 6
          : -zipf();
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
        stats.total += 1;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache adversarial 100');
      console.debug('LRU hit ratio', stats.lru * 100 / stats.total);
      console.debug('DWC hit ratio', stats.dwc * 100 / stats.total);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 28);
    });

    it('ratio jump 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 100;
      const zipf = zipfian(1, capacity * 1e2, 0.8, xorshift.random(1));
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        // スキャン耐性と適応が逆効果となる一度限りのアクセス
        const key = zipf() + (i / capacity | 0) * capacity * 1e2;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
        stats.total += 1;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache jump 100');
      console.debug('LRU hit ratio', stats.lru * 100 / stats.total);
      console.debug('DWC hit ratio', stats.dwc * 100 / stats.total);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 20);
    });

    it('ratio loop 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);

      const trials = capacity * 20;
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = i % (capacity * 10);
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
        stats.total += 1;
        i + 1 === trials - capacity * 10 && stats.clear();
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache loop 100');
      console.debug('LRU hit ratio', stats.lru * 100 / stats.total);
      console.debug('DWC hit ratio', stats.dwc * 100 / stats.total);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 === Infinity);
      assert(stats.dwc * 100 / stats.total >>> 0 === 9);
    });

    // レジリエンスのテスト(復元が順調に進んでいれば途上のヒット率は低くてよい)
    // キャッシュサイズが相対的に大きい場合はウインドウ内でのヒットによりアンロックされる
    // キャッシュサイズが相対的に小さい場合はサンプルの挿入とヒットによりアンロックされる

    // 統計汚染
    function lock(
      capacity: number,
      lru: LRU<unknown, unknown>,
      dwc: Cache<unknown, unknown>,
    ): void {
      for (let i = 0; i < capacity * 100; ++i) {
        lru.set(Number.MIN_SAFE_INTEGER + i, 1);
        dwc.set(Number.MIN_SAFE_INTEGER + i, 1);
        if (i + 1 !== capacity) continue;
        for (const { key } of [...dwc['LRU']].slice(dwc['window'])) {
          dwc.get(key);
        }
      }
      assert(dwc['LFU'].length === capacity - dwc['window']);
      assert(dwc['partition'] === capacity - dwc['window']);
      assert(dwc['declination'] === 8);
      dwc['injection'] = 0;
    }

    it('ratio lock jump 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);
      lock(capacity, lru, dwc);

      const trials = capacity * 100;
      const zipf = zipfian(1, capacity * 1e2, 0.8, xorshift.random(1));
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        // スキャン耐性と適応が逆効果となる一度限りのアクセス
        const key = zipf() + (i / capacity | 0) * capacity * 1e2;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
        stats.total += 1;
        i + 1 === trials - capacity * 10 && stats.clear();
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache lock jump 100');
      console.debug('LRU hit ratio', stats.lru * 100 / stats.total);
      console.debug('DWC hit ratio', stats.dwc * 100 / stats.total);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 24);
    });

    it('ratio lock loop 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);
      lock(capacity, lru, dwc);

      const trials = capacity * 40;
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = i % (capacity * 10);
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
        stats.total += 1;
        i + 1 === trials - capacity * 10 && stats.clear();
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache lock loop 100');
      console.debug('LRU hit ratio', stats.lru * 100 / stats.total);
      console.debug('DWC hit ratio', stats.dwc * 100 / stats.total);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 === Infinity);
      assert(stats.dwc * 100 / stats.total >>> 0 === 9);
      assert(dwc['partition']! * 100 / capacity >>> 0 === 0);
    });

    it('ratio lock LIR 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);
      lock(capacity, lru, dwc);

      // サンプルにヒットする確率の安定性に依存するため容量または試行回数の増加により改善される
      // 逆にサンプリングのジャミングが最も効果的に復元を阻害する
      const trials = capacity * 40;
      const zipf = zipfian(1, capacity * 1e2, 0.8, xorshift.random(1));
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = zipf();
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
        stats.total += 1;
        i + 1 === trials - capacity * 10 && stats.clear();
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache lock LIR 100');
      console.debug('LRU hit ratio', stats.lru * 100 / stats.total);
      console.debug('DWC hit ratio', stats.dwc * 100 / stats.total);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 110);
      assert(dwc['partition']! * 100 / capacity >>> 0 === 99);
    });

    it('ratio lock HIR 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const dwc = new Cache<number, 1>(capacity);
      lock(capacity, lru, dwc);

      const trials = capacity * 40;
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = i % 2
          // 高ヒット率のLIRで低ヒット率のHIRの捕捉を妨害
          ? -(i / 2 | 0) % (capacity / 4 | 0) - 1 | 0
          : i % 4
            ? i % (capacity / 2 | 0) | 0
            : i + capacity;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.dwc += dwc.get(key) ?? +dwc.set(key, 1) & 0;
        stats.total += 1;
        i + 1 === trials - capacity * 10 && stats.clear();
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache lock HIR 100');
      console.debug('LRU hit ratio', stats.lru * 100 / stats.total);
      console.debug('DWC hit ratio', stats.dwc * 100 / stats.total);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 100);
      assert(dwc['partition']! * 100 / capacity >>> 0 === 0);
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
        stats.total += 1;
      }
      assert(dwc['LRU'].length + dwc['LFU'].length === dwc['dict'].size);
      assert(dwc['dict'].size <= capacity);
      console.debug('Cache uneven 1,000');
      console.debug('LRU hit ratio', stats.lru * 100 / stats.total);
      console.debug('DWC hit ratio', stats.dwc * 100 / stats.total);
      console.debug('DWC / LRU hit ratio', `${stats.dwc / stats.lru * 100 | 0}%`);
      console.debug('DWC ratio', dwc['partition']! * 100 / capacity | 0, dwc['LFU'].length * 100 / capacity | 0);
      console.debug('DWC overlap', dwc['overlapLRU'], dwc['overlapLFU']);
      assert(stats.dwc / stats.lru * 100 >>> 0 === 160);
    });

  });

});
