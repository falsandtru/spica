import { TLRU } from './tlru.lru';
import { LRU } from './lru';
import { xorshift } from './random';
import zipfian from 'zipfian-integer';

describe('Unit: lib/tlru.lru', () => {
  describe('TLRU-LRU', () => {
    for (let i = 0; i < 1000; ++i) it(`verify ${i}`, function () {
      this.timeout(10 * 1e3);

      const capacity = 4;
      const cache = new TLRU<number, number>(capacity, i % 3, (i % 4 + 99) % 100);

      const trials = capacity * 1000;
      const random = xorshift.random(i + 1);
      for (let i = 0; i < trials; ++i) {
        const key = random() * capacity * 2 | 0;
        if (cache.has(key)) {
          assert(cache.get(key) === ~key);
        }
        else {
          cache.add(key, ~key);
        }
      }
      assert(cache.length === capacity);
    });

    it('order', function () {
      const capacity = 4;
      const cache = new TLRU<number, 1>(capacity);
      for (let i = 0; i < capacity; ++i) {
        cache.add(~i, 1);
      }
      for (const i of [1, 2, 3, 3, 2, 4]) {
        cache.get(i) ?? cache.add(i, 1);
      }
      assert.deepStrictEqual(
        [...cache].map(t => t[0]),
        [2, 3, 4, 1]);
    });

    class Stats {
      trc = 0;
      lru = 0;
    }

    it('even 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const trc = new TLRU<number, 1>(capacity);
      const lru = new LRU<number, 1>(capacity);

      const trials = capacity * 1000;
      const random = xorshift.random(1);
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random() * capacity * 10 | 0;
        stats.trc += trc.get(key) ?? +trc.set(key, 1) & 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
      }
      console.debug('TLRU-LRU even 100');
      console.debug('LRU hits', stats.lru);
      console.debug('TRC hits', stats.trc);
      console.debug('TRC / LRU hit ratio', `${stats.trc / stats.lru * 100 | 0}%`);
      assert(stats.trc / stats.lru * 100 >>> 0 === 99);
    });

    it('zipf 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const trc = new TLRU<number, 1>(capacity);
      const lru = new LRU<number, 1>(capacity);

      const trials = capacity * 1000;
      const random = zipfian(1, capacity * 1e3, 0.8, xorshift.random(1));
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random();
        stats.trc += trc.get(key) ?? +trc.set(key, 1) & 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
      }
      console.debug('TLRU-LRU zipf 100');
      console.debug('LRU hits', stats.lru);
      console.debug('TRC hits', stats.trc);
      console.debug('TRC / LRU hit ratio', `${stats.trc / stats.lru * 100 | 0}%`);
      assert(stats.trc / stats.lru * 100 >>> 0 === 166);
    });

    it('zipf 1,000', function () {
      this.timeout(60 * 1e3);

      const capacity = 1000;
      const trc = new TLRU<number, 1>(capacity);
      const lru = new LRU<number, 1>(capacity);

      const trials = capacity * 100;
      const random = zipfian(1, capacity * 1e3, 0.8, xorshift.random(1));
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random();
        stats.trc += trc.get(key) ?? +trc.set(key, 1) & 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
      }
      console.debug('TLRU-LRU zipf 1000');
      console.debug('LRU hits', stats.lru);
      console.debug('TRC hits', stats.trc);
      console.debug('TRC / LRU hit ratio', `${stats.trc / stats.lru * 100 | 0}%`);
      assert(stats.trc / stats.lru * 100 >>> 0 === 141);
    });

  });

});
