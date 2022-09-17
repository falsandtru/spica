import { benchmark } from './benchmark';
import { Cache } from '../src/cache';
import LRUCache from 'lru-cache';
import { xorshift } from '../src/random';
import { captureTimers } from '../src/timer';

describe('Benchmark:', function () {
  describe('Cache', function () {
    it('LRU new', function (done) {
      benchmark('LRUCache new', () => new LRUCache({ max: 1000 }), done);
    });

    it('DWC new', function (done) {
      benchmark('DW-Cache new', () => new Cache(1000), done);
    });

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`LRU set ${length.toLocaleString('en')} 0%`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, object>({ max: capacity });
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`LRUCache set ${length.toLocaleString('en')} 0%`, () => cache.set(random() * -capacity - 1 | 0, {}), done);
      });

      it(`DWC set ${length.toLocaleString('en')} 0%`, function (done) {
        const capacity = length;
        const cache = new Cache<number, object>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`DW-Cache set ${length.toLocaleString('en')} 0%`, () => cache.set(random() * -capacity - 1 | 0, {}), done);
      });
    }

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`LRU set ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, object>({ max: capacity });
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`LRUCache set ${length.toLocaleString('en')} 100%`, () => cache.set(random() * capacity | 0, {}), done);
      });

      it(`DWC set ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new Cache<number, object>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`DW-Cache set ${length.toLocaleString('en')} 100%`, () => cache.set(random() * capacity | 0, {}), done);
      });
    }

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`LRU get ${length.toLocaleString('en')} 0%`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, object>({ max: capacity });
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`LRUCache get ${length.toLocaleString('en')} 0%`, () => cache.get(random() * -capacity - 1 | 0), done);
      });

      it(`DWC get ${length.toLocaleString('en')} 0%`, function (done) {
        const capacity = length;
        const cache = new Cache<number, object>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`DW-Cache get ${length.toLocaleString('en')} 0%`, () => cache.get(random() * -capacity - 1 | 0), done);
      });
    }

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`LRU get ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, object>({ max: capacity });
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`LRUCache get ${length.toLocaleString('en')} 100%`, () => cache.get(random() * capacity | 0), done);
      });

      it(`DWC get ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new Cache<number, object>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`DW-Cache get ${length.toLocaleString('en')} 100%`, () => cache.get(random() * capacity | 0), done);
      });
    }

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`LRU simulation ${length.toLocaleString('en')}`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, object>({ max: capacity });
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`LRUCache simulation ${length.toLocaleString('en')}`, () => {
          const key = random() < 0.8
            ? random() * capacity * 1 | 0
            : random() * capacity * 9 + capacity | 0;
          cache.get(key) ?? cache.set(key, {});
        }, done);
      });

      it(`DWC simulation ${length.toLocaleString('en')}`, function (done) {
        const capacity = length;
        const cache = new Cache<number, object>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`DW-Cache simulation ${length.toLocaleString('en')}`, () => {
          const key = random() < 0.8
            ? random() * capacity * 1 | 0
            : random() * capacity * 9 + capacity | 0;
          cache.get(key) ?? cache.set(key, {});
        }, done);
      });
    }

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`LRU simulation ${length.toLocaleString('en')} expire`, captureTimers(function (done) {
        const capacity = length;
        const cache = new LRUCache<number, object>({ max: capacity, ttl: 1, ttlAutopurge: true });
        const age = (r => () => r() * 1e8 | 0)(xorshift.random(1));
        for (let i = 0; i < capacity; ++i) cache.set(i, {}, { ttl: age() });
        const random = xorshift.random(1);
        benchmark(`LRUCache simulation ${length.toLocaleString('en')} expire`, () => {
          const key = random() < 0.8
            ? random() * capacity * 1 | 0
            : random() * capacity * 9 + capacity | 0;
          cache.get(key) ?? cache.set(key, {}, { ttl: age() });
        }, done);
      }));

      it(`DWC simulation ${length.toLocaleString('en')} expire`, function (done) {
        const capacity = length;
        const cache = new Cache<number, object>(capacity, { age: 1, earlyExpiring: true });
        const age = (r => () => r() * 1e8 | 0)(xorshift.random(1));
        for (let i = 0; i < capacity; ++i) cache.set(i, {}, { age: age() });
        const random = xorshift.random(1);
        benchmark(`DW-Cache simulation ${length.toLocaleString('en')} expire`, () => {
          const key = random() < 0.8
            ? random() * capacity * 1 | 0
            : random() * capacity * 9 + capacity | 0;
          cache.get(key) ?? cache.set(key, {}, { age: age() });
        }, done);
      });
    }

  });

});
