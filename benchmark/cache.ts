import { benchmark } from './benchmark';
import { Clock } from '../src/clock';
import { LRU } from '../src/lru';
import { Cache } from '../src/cache';
import LRUCache from 'lru-cache';
import { xorshift } from '../src/random';
import { captureTimers } from '../src/timer';

describe('Benchmark:', function () {
  describe('Cache', function () {
    it('Clock new', function (done) {
      benchmark('Clock    new', () => new LRU(10000), done);
    });

    it('ISC new', function (done) {
      benchmark('ISCCache new', () => new LRUCache({ max: 10000 }), done);
    });

    it('LRU new', function (done) {
      benchmark('LRUCache new', () => new LRU(10000), done);
    });

    it('DWC new', function (done) {
      benchmark('DW-Cache new', () => new Cache(10000), done);
    });

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Clock set ${length.toLocaleString('en')} 0%`, function (done) {
        const capacity = length;
        const cache = new Clock<number, object>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`Clock    set ${length.toLocaleString('en')} 0%`, () => cache.set(random() * -capacity - 1 | 0, {}), done);
      });

      it(`ISC set ${length.toLocaleString('en')} 0%`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, object>({ max: capacity });
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`ISCCache set ${length.toLocaleString('en')} 0%`, () => cache.set(random() * -capacity - 1 | 0, {}), done);
      });

      it(`LRU set ${length.toLocaleString('en')} 0%`, function (done) {
        const capacity = length;
        const cache = new LRU<number, object>(capacity);
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
      it(`Clock set ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new Clock<number, object>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`Clock    set ${length.toLocaleString('en')} 100%`, () => cache.set(random() * capacity | 0, {}), done);
      });

      it(`ISC set ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, object>({ max: capacity });
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`ISCCache set ${length.toLocaleString('en')} 100%`, () => cache.set(random() * capacity | 0, {}), done);
      });

      it(`LRU set ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new LRU<number, object>(capacity);
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
      it(`Clock get ${length.toLocaleString('en')} 0%`, function (done) {
        const capacity = length;
        const cache = new Clock<number, object>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`Clock    get ${length.toLocaleString('en')} 0%`, () => cache.get(random() * -capacity - 1 | 0), done);
      });

      it(`ISC get ${length.toLocaleString('en')} 0%`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, object>({ max: capacity });
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`ISCCache get ${length.toLocaleString('en')} 0%`, () => cache.get(random() * -capacity - 1 | 0), done);
      });

      it(`LRU get ${length.toLocaleString('en')} 0%`, function (done) {
        const capacity = length;
        const cache = new LRU<number, object>(capacity);
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
      it(`Clock get ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new Clock<number, object>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`Clock    get ${length.toLocaleString('en')} 100%`, () => cache.get(random() * capacity | 0), done);
      });

      it(`ISC get ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, object>({ max: capacity });
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`ISCCache get ${length.toLocaleString('en')} 100%`, () => cache.get(random() * capacity | 0), done);
      });

      it(`LRU get ${length.toLocaleString('en')} 100%`, function (done) {
        const capacity = length;
        const cache = new LRU<number, object>(capacity);
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

    // 1e7はシミュだけ実行するとLRU単体でもGitHub Actionsの次の環境とエラーで落ちる。
    // ベンチ全体を実行したときはなぜか落ちない。
    //
    // Error: Uncaught RangeError: Map maximum size exceeded (dist/index.js:16418)
    //
    // System:
    //   OS: Linux 5.15 Ubuntu 20.04.5 LTS (Focal Fossa)
    //   CPU: (2) x64 Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz
    //   Memory: 5.88 GB / 6.78 GB
    //
    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Clock simulation ${length.toLocaleString('en')}`, function (done) {
        const capacity = length;
        const cache = new Clock<number, object>(capacity);
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`Clock    simulation ${length.toLocaleString('en')}`, () => {
          const key = random() < 0.8
            ? random() * capacity * 1 | 0
            : random() * capacity * 9 + capacity | 0;
          cache.get(key) ?? cache.set(key, {});
        }, done);
      });

      it(`ISC simulation ${length.toLocaleString('en')}`, function (done) {
        const capacity = length;
        const cache = new LRUCache<number, object>({ max: capacity });
        for (let i = 0; i < capacity; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`ISCCache simulation ${length.toLocaleString('en')}`, () => {
          const key = random() < 0.8
            ? random() * capacity * 1 | 0
            : random() * capacity * 9 + capacity | 0;
          cache.get(key) ?? cache.set(key, {});
        }, done);
      });

      it(`LRU simulation ${length.toLocaleString('en')}`, function (done) {
        const capacity = length;
        const cache = new LRU<number, object>(capacity);
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
      it(`ISC simulation ${length.toLocaleString('en')} expire`, captureTimers(function (done) {
        const capacity = length;
        const cache = new LRUCache<number, object>({ max: capacity, ttl: 1, ttlAutopurge: true });
        const age = (r => () => r() * 1e8 | 0)(xorshift.random(1));
        for (let i = 0; i < capacity; ++i) cache.set(i, {}, { ttl: age() });
        const random = xorshift.random(1);
        benchmark(`ISCCache simulation ${length.toLocaleString('en')} expire`, () => {
          const key = random() < 0.8
            ? random() * capacity * 1 | 0
            : random() * capacity * 9 + capacity | 0;
          cache.get(key) ?? cache.set(key, {}, { ttl: age() });
        }, done);
      }));

      it(`DWC simulation ${length.toLocaleString('en')} expire`, function (done) {
        const capacity = length;
        const cache = new Cache<number, object>(capacity, { age: 1, eagerExpiration: true });
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
