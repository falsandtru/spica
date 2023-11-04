import { S3FIFO } from './s3-fifo';
import { LRU } from './lru';
import { xorshift } from './random';
import zipfian from 'zipfian-integer';

describe('Unit: lib/s3-fifo', () => {
  describe('S3FIFO', () => {
    it('verify', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const cache = new S3FIFO<number, number>(capacity);

      const trials = capacity * 1000;
      const random = xorshift.random(1);
      for (let i = 0; i < trials; ++i) {
        const key = random() * capacity * 10 | 0;
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
      s3f = 0;
      lru = 0;
    }

    it('even 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const s3f = new S3FIFO<number, 1>(capacity);
      const lru = new LRU<number, 1>(capacity);

      const trials = capacity * 1000;
      const random = xorshift.random(1);
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random() * capacity * 10 | 0;
        stats.s3f += s3f.get(key) ?? +s3f.set(key, 1) & 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
      }
      console.debug('S3FIFO even 100');
      console.debug('LRU hits', stats.lru);
      console.debug('S3F hits', stats.s3f);
    });

    it('zipf 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const s3f = new S3FIFO<number, 1>(capacity);
      const lru = new LRU<number, 1>(capacity);

      const trials = capacity * 1000;
      const random = zipfian(1, capacity * 1e3, 0.8, xorshift.random(1));
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random();
        stats.s3f += s3f.get(key) ?? +s3f.set(key, 1) & 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
      }
      console.debug('S3FIFO zipf 100');
      console.debug('LRU hits', stats.lru);
      console.debug('S3F hits', stats.s3f);
    });

    it('zipf 1,000', function () {
      this.timeout(60 * 1e3);

      const capacity = 1000;
      const s3f = new S3FIFO<number, 1>(capacity);
      const lru = new LRU<number, 1>(capacity);

      const trials = capacity * 100;
      const random = zipfian(1, capacity * 1e3, 0.8, xorshift.random(1));
      const stats = new Stats();
      for (let i = 0; i < trials; ++i) {
        const key = random();
        stats.s3f += s3f.get(key) ?? +s3f.set(key, 1) & 0;
        stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
      }
      console.debug('S3FIFO zipf 1000');
      console.debug('LRU hits', stats.lru);
      console.debug('S3F hits', stats.s3f);
    });

  });

});
