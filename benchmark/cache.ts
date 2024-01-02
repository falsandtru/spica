import { benchmark } from './benchmark';
import { Clock } from '../src/clock';
import { LRU } from '../src/lru';
import { Cache } from '../src/cache';
import { LRUCache } from 'lru-cache';
import { xorshift } from '../src/random';
import { captureTimers } from '../src/timer';

describe('Benchmark:', function () {
  describe('Cache', function () {
    it('Clock new', function (done) {
      benchmark('Clock    new', () => new Clock(10000), done);
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

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Clock set ${size.toLocaleString('en')} 0%`, function (done) {
        const cache = new Clock<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        let i = 0;
        benchmark(`Clock    set ${size.toLocaleString('en')} 0%`, () => cache.set(random() + ++i | 0, {}), done);
      });

      it(`ISC set ${size.toLocaleString('en')} 0%`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        let i = 0;
        benchmark(`ISCCache set ${size.toLocaleString('en')} 0%`, () => cache.set(random() + ++i | 0, {}), done);
      });

      it(`LRU set ${size.toLocaleString('en')} 0%`, function (done) {
        const cache = new LRU<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        let i = 0;
        benchmark(`LRUCache set ${size.toLocaleString('en')} 0%`, () => cache.set(random() + ++i | 0, {}), done);
      });

      it(`DWC set ${size.toLocaleString('en')} 0%`, function (done) {
        const cache = new Cache<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        let i = 0;
        benchmark(`DW-Cache set ${size.toLocaleString('en')} 0%`, () => cache.set(random() + ++i | 0, {}), done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Clock set ${size.toLocaleString('en')} 100%`, function (done) {
        const cache = new Clock<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`Clock    set ${size.toLocaleString('en')} 100%`, () => cache.set(random() * size | 0, {}), done);
      });

      it(`ISC set ${size.toLocaleString('en')} 100%`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`ISCCache set ${size.toLocaleString('en')} 100%`, () => cache.set(random() * size | 0, {}), done);
      });

      it(`LRU set ${size.toLocaleString('en')} 100%`, function (done) {
        const cache = new LRU<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`LRUCache set ${size.toLocaleString('en')} 100%`, () => cache.set(random() * size | 0, {}), done);
      });

      it(`DWC set ${size.toLocaleString('en')} 100%`, function (done) {
        const cache = new Cache<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`DW-Cache set ${size.toLocaleString('en')} 100%`, () => cache.set(random() * size | 0, {}), done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Clock get ${size.toLocaleString('en')} 0%`, function (done) {
        const cache = new Clock<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        benchmark(`Clock    get ${size.toLocaleString('en')} 0%`, () => cache.get(random() * size | 0), done);
      });

      it(`ISC get ${size.toLocaleString('en')} 0%`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        benchmark(`ISCCache get ${size.toLocaleString('en')} 0%`, () => cache.get(random() * size | 0), done);
      });

      it(`LRU get ${size.toLocaleString('en')} 0%`, function (done) {
        const cache = new LRU<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        benchmark(`LRUCache get ${size.toLocaleString('en')} 0%`, () => cache.get(random() * size | 0), done);
      });

      it(`DWC get ${size.toLocaleString('en')} 0%`, function (done) {
        const cache = new Cache<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        benchmark(`DW-Cache get ${size.toLocaleString('en')} 0%`, () => cache.get(random() * size | 0), done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Clock get ${size.toLocaleString('en')} 100%`, function (done) {
        const cache = new Clock<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`Clock    get ${size.toLocaleString('en')} 100%`, () => cache.get(random() * size | 0), done);
      });

      it(`ISC get ${size.toLocaleString('en')} 100%`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`ISCCache get ${size.toLocaleString('en')} 100%`, () => cache.get(random() * size | 0), done);
      });

      it(`LRU get ${size.toLocaleString('en')} 100%`, function (done) {
        const cache = new LRU<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`LRUCache get ${size.toLocaleString('en')} 100%`, () => cache.get(random() * size | 0), done);
      });

      it(`DWC get ${size.toLocaleString('en')} 100%`, function (done) {
        const cache = new Cache<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`DW-Cache get ${size.toLocaleString('en')} 100%`, () => cache.get(random() * size | 0), done);
      });
    }

    // 1e7はシミュだけ実行するとISCが単体でもGitHub Actionsの次の環境とエラーで落ちる。
    // ベンチ全体を実行したときはなぜか落ちない。
    //
    // Error: Uncaught RangeError: Map maximum size exceeded (dist/index.js:16418)
    //
    // System:
    //   OS: Linux 5.15 Ubuntu 20.04.5 LTS (Focal Fossa)
    //   CPU: (2) x64 Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz
    //   Memory: 5.88 GB / 6.78 GB
    //
    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      const bias = (rng: () => number) => () => rng() * size * 10 | 0;
      it(`Clock simulation ${size.toLocaleString('en')} 10%`, function (done) {
        const cache = new Clock<number, object>(size);
        const random = bias(xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`Clock    simulation ${size.toLocaleString('en')} 10%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`ISC simulation ${size.toLocaleString('en')} 10%`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        const random = bias(xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`ISCCache simulation ${size.toLocaleString('en')} 10%`, () => {
          const key = random();
          cache.get(key) ?? cache.set(key, {});
        }, done);
      });

      it(`LRU simulation ${size.toLocaleString('en')} 10%`, function (done) {
        const cache = new LRU<number, object>(size);
        const random = bias(xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`LRUCache simulation ${size.toLocaleString('en')} 10%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`DWC simulation ${size.toLocaleString('en')} 10%`, function (done) {
        const cache = new Cache<number, object>(size);
        const random = bias(xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`DW-Cache simulation ${size.toLocaleString('en')} 10%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      const bias = (rng: () => number) => () => rng() * size * 1.1 | 0;
      it(`Clock simulation ${size.toLocaleString('en')} 90%`, function (done) {
        const cache = new Clock<number, object>(size);
        const random = bias(xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`Clock    simulation ${size.toLocaleString('en')} 90%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`ISC simulation ${size.toLocaleString('en')} 90%`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        const random = bias(xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`ISCCache simulation ${size.toLocaleString('en')} 90%`, () => {
          const key = random();
          cache.get(key) ?? cache.set(key, {});
        }, done);
      });

      it(`LRU simulation ${size.toLocaleString('en')} 90%`, function (done) {
        const cache = new LRU<number, object>(size);
        const random = bias(xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`LRUCache simulation ${size.toLocaleString('en')} 90%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`DWC simulation ${size.toLocaleString('en')} 90%`, function (done) {
        const cache = new Cache<number, object>(size);
        const random = bias(xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`DW-Cache simulation ${size.toLocaleString('en')} 90%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      const bias = (rng: () => number) => () => rng() * size * 1.1 | 0;
      it(`ISC simulation ${size.toLocaleString('en')} 90% expire`, captureTimers(function (done) {
        const cache = new LRUCache<number, object>({ max: size, ttl: 1, ttlAutopurge: true });
        const age = (r => () => r() * 1e3 | 0)(xorshift.random(1));
        const random = bias(xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`ISCCache simulation ${size.toLocaleString('en')} 90% expire`, () => {
          const key = random();
          cache.get(key) ?? cache.set(key, {}, { ttl: age() });
        }, done);
      }));

      it(`DWC simulation ${size.toLocaleString('en')} 90% expire`, function (done) {
        const cache = new Cache<number, object>(size, { age: 1, eagerExpiration: true });
        const age = (r => () => r() * 1e3 | 0)(xorshift.random(1));
        const random = bias(xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`DW-Cache simulation ${size.toLocaleString('en')} 90% expire`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {}, { age: age() });
        }, done);
      });
    }

  });

});
