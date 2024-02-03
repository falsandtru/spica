import { SLRU } from './slru';
import { LRU } from './lru';
import { xorshift } from './random';
import zipfian from 'zipfian-integer';

describe('Unit: lib/slru', () => {
  describe('SLRU', () => {
    for (let i = 0; i < 100; ++i) it(`verify ${i}`, function () {
      this.timeout(10 * 1e3);

      const capacity = 4;
      const cache = new SLRU<number, number>(capacity);

      const trials = capacity * 1000;
      const random = xorshift.random(i + 1);
      for (let i = 0; i < trials; ++i) {
        const key = random() * capacity * 2 | 0;
        if (cache.has(key)) {
          assert(cache.get(key) === ~key);
        }
        else {
          cache.set(key, ~key);
        }
      }
      assert(cache.length === capacity);
    });

    class Stats {
      lfu = 0;
      lru = 0;
    }

    it('even 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lfu = new SLRU<number, 1>(capacity);
      const lru = new LRU<number, 1>(capacity);

      const trials = capacity * 1000;
      const random = xorshift.random(1);
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random() * capacity * 10 | 0;
        stats.lfu += lfu.get(key) ?? +lfu.set(key, 1) & 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
      }
      console.debug('SLRU even 100');
      console.debug('LRU  hits', stats.lru);
      console.debug('SLRU hits', stats.lfu);
      console.debug('SLRU / LRU hit ratio', `${stats.lfu / stats.lru * 100 | 0}%`);
      assert(stats.lfu / stats.lru * 100 >>> 0 === 99);
    });

    it('zipf 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lfu = new SLRU<number, 1>(capacity);
      const lru = new LRU<number, 1>(capacity);

      const trials = capacity * 1000;
      const random = zipfian(1, capacity * 1e3, 0.8, xorshift.random(1));
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random();
        stats.lfu += lfu.get(key) ?? +lfu.set(key, 1) & 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
      }
      console.debug('SLRU zipf 100');
      console.debug('LRU  hits', stats.lru);
      console.debug('SLRU hits', stats.lfu);
      console.debug('SLRU / LRU hit ratio', `${stats.lfu / stats.lru * 100 | 0}%`);
      assert(stats.lfu / stats.lru * 100 >>> 0 === 227);
    });

    it('zipf 1,000', function () {
      this.timeout(60 * 1e3);

      const capacity = 1000;
      const lfu = new SLRU<number, 1>(capacity);
      const lru = new LRU<number, 1>(capacity);

      const trials = capacity * 100;
      const random = zipfian(1, capacity * 1e3, 0.8, xorshift.random(1));
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random();
        stats.lfu += lfu.get(key) ?? +lfu.set(key, 1) & 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
      }
      console.debug('SLRU zipf 1000');
      console.debug('LRU  hits', stats.lru);
      console.debug('SLRU hits', stats.lfu);
      console.debug('SLRU / LRU hit ratio', `${stats.lfu / stats.lru * 100 | 0}%`);
      assert(stats.lfu / stats.lru * 100 >>> 0 === 155);
    });

  });

});
