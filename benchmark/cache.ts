import { benchmark } from './benchmark';
import { Cache } from '../src/cache';
import LRUCache from 'lru-cache';
import { Math } from '../src/global';

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
        const cache = new LRUCache<number, number>({ max: capacity });
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        benchmark(`LRUCache set ${length.toLocaleString('en')} 0%`, () => cache.set(Math.random() * -capacity - 1 | 0, 0), done);
      });

      it(`DWC set ${length.toLocaleString('en')} 0%`, function (done) {
        const capacity = length;
        const cache = new Cache<number, number>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        benchmark(`DW-Cache set ${length.toLocaleString('en')} 0%`, () => cache.set(Math.random() * -capacity - 1 | 0, 0), done);
      });
    }

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`LRU set ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, number>({ max: capacity });
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        benchmark(`LRUCache set ${length.toLocaleString('en')} 100%`, () => cache.set(Math.random() * capacity | 0, 0), done);
      });

      it(`DWC set ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new Cache<number, number>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        benchmark(`DW-Cache set ${length.toLocaleString('en')} 100%`, () => cache.set(Math.random() * capacity | 0, 0), done);
      });
    }

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`LRU get ${length.toLocaleString('en')} 0%`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, number>({ max: capacity });
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        benchmark(`LRUCache get ${length.toLocaleString('en')} 0%`, () => cache.get(Math.random() * -capacity - 1 | 0), done);
      });

      it(`DWC get ${length.toLocaleString('en')} 0%`, function (done) {
        const capacity = length;
        const cache = new Cache<number, number>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        benchmark(`DW-Cache get ${length.toLocaleString('en')} 0%`, () => cache.get(Math.random() * -capacity - 1 | 0), done);
      });
    }

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`LRU get ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, number>({ max: capacity });
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        benchmark(`LRUCache get ${length.toLocaleString('en')} 100%`, () => cache.get(Math.random() * capacity | 0), done);
      });

      it(`DWC get ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new Cache<number, number>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        benchmark(`DW-Cache get ${length.toLocaleString('en')} 100%`, () => cache.get(Math.random() * capacity | 0), done);
      });
    }

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`LRU simulation ${length.toLocaleString('en')}`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, number>({ max: capacity });
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        benchmark(`LRUCache simulation ${length.toLocaleString('en')}`, () => {
          const key = Math.random() < 0.8
            ? Math.random() * capacity * 1 | 0
            : Math.random() * capacity * 9 + capacity | 0;
          cache.get(key) ?? cache.set(key, key);
        }, done);
      });

      it(`DWC simulation ${length.toLocaleString('en')}`, function (done) {
        const capacity = length;
        const cache = new Cache<number, number>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        benchmark(`DW-Cache simulation ${length.toLocaleString('en')}`, () => {
          const key = Math.random() < 0.8
            ? Math.random() * capacity * 1 | 0
            : Math.random() * capacity * 9 + capacity | 0;
          cache.get(key) ?? cache.set(key, key);
        }, done);
      });
    }

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5]) {
      it(`LRU simulation ${length.toLocaleString('en')} expire`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, number>({ max: capacity, ttl: 1, ttlAutopurge: true });
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        benchmark(`LRUCache simulation ${length.toLocaleString('en')} expire`, () => {
          const key = Math.random() < 0.8
            ? Math.random() * capacity * 1 | 0
            : Math.random() * capacity * 9 + capacity | 0;
          cache.get(key) ?? cache.set(key, key);
        }, done);
      });
    }

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`DWC simulation ${length.toLocaleString('en')} expire`, function (done) {
        const capacity = length;
        const cache = new Cache<number, number>(capacity, { age: 1, earlyExpiring: true });
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        benchmark(`DW-Cache simulation ${length.toLocaleString('en')} expire`, () => {
          const key = Math.random() < 0.8
            ? Math.random() * capacity * 1 | 0
            : Math.random() * capacity * 9 + capacity | 0;
          cache.get(key) ?? cache.set(key, key);
        }, done);
      });
    }

  });

});
