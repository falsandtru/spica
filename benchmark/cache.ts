import { benchmark } from './benchmark';
import { Cache } from '../';
import LRUCache from 'lru-cache';
import { Math } from '../src/global';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Cache', function () {
    this.beforeEach(done => {
      setTimeout(done, 1000);
    });

    it('new', function (done) {
      benchmark('Cache new', () => new Cache(1000), done);
    });

    for (const length of [10, 100, 1000, 10000, 100000]) {
      it(`LRU set ${length.toLocaleString('en')} 0%`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, number>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        let i = 0;
        benchmark(`LRUCache set ${length.toLocaleString('en')} 0%`, () => cache.set(--i, 0), done);
      });

      it(`DWC set ${length.toLocaleString('en')} 0%`, function (done) {
        const capacity = length;
        const cache = new Cache<number, number>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        let i = 0;
        benchmark(`DW-Cache set ${length.toLocaleString('en')} 0%`, () => cache.set(--i, 0), done);
      });
    }

    for (const length of [10, 100, 1000, 10000, 100000]) {
      it(`LRU set ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, number>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        let i = 0;
        benchmark(`LRUCache set ${length.toLocaleString('en')} 100%`, () => cache.set(++i % capacity, 0), done);
      });

      it(`DWC set ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new Cache<number, number>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        let i = 0;
        benchmark(`DW-Cache set ${length.toLocaleString('en')} 100%`, () => cache.set(++i % capacity, 0), done);
      });
    }

    for (const length of [10, 100, 1000, 10000, 100000]) {
      it(`LRU set ${length.toLocaleString('en')} 100% random`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, number>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        benchmark(`LRUCache set ${length.toLocaleString('en')} 100% random`, () => cache.set(Math.random() * capacity | 0, 0), done);
      });

      it(`DWC set ${length.toLocaleString('en')} 100% random`, function (done) {
        const capacity = length;
        const cache = new Cache<number, number>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        benchmark(`DW-Cache set ${length.toLocaleString('en')} 100% random`, () => cache.set(Math.random() * capacity | 0, 0), done);
      });
    }

    for (const length of [10, 100, 1000, 10000, 100000]) {
      it(`LRU get ${length.toLocaleString('en')} 0%`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, number>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        let i = 0;
        benchmark(`LRUCache get ${length.toLocaleString('en')} 0%`, () => cache.get(--i), done);
      });

      it(`DWC get ${length.toLocaleString('en')} 0%`, function (done) {
        const capacity = length;
        const cache = new Cache<number, number>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        let i = 0;
        benchmark(`DW-Cache get ${length.toLocaleString('en')} 0%`, () => cache.get(--i), done);
      });
    }

    for (const length of [10, 100, 1000, 10000, 100000]) {
      it(`LRU get ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, number>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        let i = 0;
        benchmark(`LRUCache get ${length.toLocaleString('en')} 100%`, () => cache.get(++i % capacity), done);
      });

      it(`DWC get ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new Cache<number, number>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        let i = 0;
        benchmark(`DW-Cache get ${length.toLocaleString('en')} 100%`, () => cache.get(++i % capacity), done);
      });
    }

    for (const length of [10, 100, 1000, 10000, 100000]) {
      it(`LRU get ${length.toLocaleString('en')} 100% random`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, number>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        benchmark(`LRUCache get ${length.toLocaleString('en')} 100% random`, () => cache.get(Math.random() * capacity | 0), done);
      });

      it(`DWC get ${length.toLocaleString('en')} 100% random`, function (done) {
        const capacity = length;
        const cache = new Cache<number, number>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, i);
        benchmark(`DW-Cache get ${length.toLocaleString('en')} 100% random`, () => cache.get(Math.random() * capacity | 0), done);
      });
    }

  });

});
