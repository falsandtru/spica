import { LRU } from './lru';
import { LRUCache } from 'lru-cache';
import { xorshift } from './random';
import zipfian from 'zipfian-integer';

describe('Unit: lib/lru', () => {
  describe('LRU', () => {
    it('verify', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const cache = new LRU<number, number>(capacity);

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

    class Stats {
      lru = 0;
      isc = 0;
    }

    it('even 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const isc = new LRUCache<number, 1>({ max: capacity });

      const trials = capacity * 1000;
      const random = xorshift.random(1);
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random() * capacity * 10 | 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.isc += isc.get(key) ?? +isc.set(key, 1) & 0;
      }
      console.debug('LRU even 100');
      console.debug('ISC hits', stats.isc);
      console.debug('LRU hits', stats.lru);
      assert(stats.lru === stats.isc);
    });

    it('zipf 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const isc = new LRUCache<number, 1>({ max: capacity });

      const trials = capacity * 1000;
      const random = zipfian(1, capacity * 1e7, 0.8, xorshift.random(1));
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random();
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.isc += isc.get(key) ?? +isc.set(key, 1) & 0;
      }
      console.debug('LRU zipf 100');
      console.debug('ISC hits', stats.isc);
      console.debug('LRU hits', stats.lru);
      assert(stats.lru === stats.isc);
    });

    it('zipf 1,000', function () {
      this.timeout(60 * 1e3);

      const capacity = 1000;
      const lru = new LRU<number, 1>(capacity);
      const isc = new LRUCache<number, 1>({ max: capacity });

      const trials = capacity * 100;
      const random = zipfian(1, capacity * 1e7, 0.8, xorshift.random(1));
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random();
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
        stats.isc += isc.get(key) ?? +isc.set(key, 1) & 0;
      }
      console.debug('LRU zipf 1000');
      console.debug('ISC hits', stats.isc);
      console.debug('LRU hits', stats.lru);
      assert(stats.lru === stats.isc);
    });

  });

});
