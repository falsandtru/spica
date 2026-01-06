import { TClock } from './tclock';
import { LRU } from './lru';
import { xorshift } from './random';
import zipfian from 'zipfian-integer';

describe('Unit: lib/tclock', () => {
  describe('TClock', () => {
    it('get/set', function () {
      const capacity = 96;
      const clock = new TClock<number, number>(capacity - 1, Infinity, 100);
      assert(clock['capacity'] === capacity);

      for (let i = 0; i < capacity * 2; ++i) {
        clock.set(i, i);
      }
      assert(clock['values'].length === capacity);
      for (let i = capacity; i < capacity * 2; ++i) {
        assert(clock.get(i) === i);
      }
      for (let i = 0; i < capacity; ++i) {
        clock.set(i, i);
      }
      for (let i = 0; i < capacity; ++i) {
        assert(clock.get(i) === i);
      }
    });

    it('delete', function () {
      const capacity = 32;
      const clock = new TClock<number, number>(capacity);

      for (let i = 0; i < capacity; ++i) {
        clock.set(i, i);
      }
      assert(clock.delete(0) === true);
      clock.set(0, 0);
      assert(clock.get(1) === 1);
      assert(clock.delete(1) === true);
      clock.set(1, 1);
      assert(clock.get(2) === 2);
      assert(clock.delete(2) === true);
      clock.set(2, 2);
      assert(clock.delete(31) === true);
      clock.set(32, 32);
      assert(clock.get(3) === 3);
      assert(clock.length === 32);
      assert(clock.delete(30) === true);
      assert(clock.delete(29) === true);
      clock.set(33, 33);
      clock.set(34, 34);
      assert(clock.get(4) === 4);
      assert(clock.get(5) === undefined);
      assert(clock.length === 31);
    });

    it('limit', function () {
      const capacity = 64;
      const clock = new TClock<number, number>(capacity, 32);

      for (let i = 0; i < capacity; ++i) {
        clock.set(i, i);
        clock.get(i);
      }
      clock.set(capacity, capacity);
      assert(clock.has(31) === true);
      assert(clock.has(32) === false);
      assert(clock.has(33) === true);
    });

    for (let i = 0; i < 10; ++i) it(`verify ${i}`, function () {
      this.timeout(10 * 1e3);

      const capacity = 32 * (i % 3 + 1);
      const clock = new TClock<number, number>(capacity);

      const trials = capacity * 1000;
      const random = xorshift.random(i + 1);
      for (let i = 0; i < trials; ++i) {
        const key = random() * capacity * 2 | 0;
        if (clock.has(key)) {
          assert(clock.get(key) === ~key);
        }
        else {
          clock.add(key, ~key);
        }
        assert(clock.length <= capacity);
        assert(clock['values'].length === clock.length);
        assert(clock['values'].length === clock['dict'].size);
      }
      assert(clock.length === capacity);
    });

    class Stats {
      clock = 0;
      lru = 0;
    }

    it('even 128', function () {
      this.timeout(10 * 1e3);

      const capacity = 128;
      const clock = new TClock<number, 1>(capacity);
      const lru = new LRU<number, 1>(capacity);

      const trials = capacity * 1000;
      const random = xorshift.random(1);
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random() * capacity * 10 | 0;
        stats.clock += clock.get(key) ?? +clock.set(key, 1) & 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
      }
      console.debug('TClock even 128');
      console.debug('LRU    hits', stats.lru);
      console.debug('TClock hits', stats.clock);
      console.debug('TClock / LRU hit ratio', `${stats.clock / stats.lru * 100 | 0}%`);
      assert(stats.clock / stats.lru * 100 >>> 0 === 99);
      assert(clock['values'].length === capacity);
    });

    it('zipf 128', function () {
      this.timeout(10 * 1e3);

      const capacity = 128;
      const clock = new TClock<number, 1>(capacity);
      const lru = new LRU<number, 1>(capacity);

      const trials = capacity * 1000;
      const random = zipfian(1, capacity * 1e3, 0.8, xorshift.random(1));
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random();
        stats.clock += clock.get(key) ?? +clock.set(key, 1) & 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
      }
      console.debug('TClock zipf 128');
      console.debug('LRU    hits', stats.lru);
      console.debug('TClock hits', stats.clock);
      console.debug('TClock / LRU hit ratio', `${stats.clock / stats.lru * 100 | 0}%`);
      assert(stats.clock / stats.lru * 100 >>> 0 === 141);
      assert(clock['values'].length === capacity);
    });

    it('zipf 1024', function () {
      this.timeout(60 * 1e3);

      const capacity = 1024;
      const clock = new TClock<number, 1>(capacity);
      const lru = new LRU<number, 1>(capacity);

      const trials = capacity * 100;
      const random = zipfian(1, capacity * 1e3, 0.8, xorshift.random(1));
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random();
        stats.clock += clock.get(key) ?? +clock.set(key, 1) & 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
      }
      console.debug('TClock zipf 1024');
      console.debug('LRU    hits', stats.lru);
      console.debug('TClock hits', stats.clock);
      console.debug('TClock / LRU hit ratio', `${stats.clock / stats.lru * 100 | 0}%`);
      assert(stats.clock / stats.lru * 100 >>> 0 === 126);
      assert(clock['values'].length === capacity);
    });

  });

});
