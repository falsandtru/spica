import { benchmark } from './benchmark';
import { Clock } from '../src/clock';
import { LRU } from '../src/lru';
import { TLRU as TRCC } from '../src/tlru.clock';
import { TLRU as TRCL } from '../src/tlru.lru';
import { Cache } from '../src/cache';
import { LRUCache } from 'lru-cache';
import { xorshift } from '../src/random';
import { captureTimers } from '../src/timer';

describe('Benchmark:', function () {
  describe('Cache', function () {
    it('Clock new', function (done) {
      benchmark('Clock new', () => new Clock(10000), done);
    });

    it('ISC new', function (done) {
      benchmark('ISC   new', () => new LRUCache({ max: 10000 }), done);
    });

    it('LRU new', function (done) {
      benchmark('LRU   new', () => new LRU(10000), done);
    });

    it('TRC-C new', function (done) {
      benchmark('TRC-C new', () => new TRCC(10000), done);
    });

    it('TRC-L new', function (done) {
      benchmark('TRC-L new', () => new TRCL(10000), done);
    });

    it('DWC new', function (done) {
      benchmark('DWC   new', () => new Cache(10000), done);
    });

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Clock set miss ${size.toLocaleString('en')}`, function (done) {
        const cache = new Clock<number, object>(size);
        for (let i = 0; i < Math.ceil(size / 32) * 32; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        let i = 0;
        benchmark(`Clock set miss ${size.toLocaleString('en')}`, () => cache.set(random() + ++i | 0, {}), done);
      });

      it(`ISC set miss ${size.toLocaleString('en')}`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        let i = 0;
        benchmark(`ISC   set miss ${size.toLocaleString('en')}`, () => cache.set(random() + ++i | 0, {}), done);
      });

      it(`LRU set miss ${size.toLocaleString('en')}`, function (done) {
        const cache = new LRU<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        let i = 0;
        benchmark(`LRU   set miss ${size.toLocaleString('en')}`, () => cache.set(random() + ++i | 0, {}), done);
      });

      it(`TRC-C set miss ${size.toLocaleString('en')}`, function (done) {
        const cache = new TRCC<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        let i = 0;
        benchmark(`TRC-C set miss ${size.toLocaleString('en')}`, () => cache.set(random() + ++i | 0, {}), done);
      });

      it(`TRC-L set miss ${size.toLocaleString('en')}`, function (done) {
        const cache = new TRCL<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        let i = 0;
        benchmark(`TRC-L set miss ${size.toLocaleString('en')}`, () => cache.set(random() + ++i | 0, {}), done);
      });

      it(`DWC set miss ${size.toLocaleString('en')}`, function (done) {
        const cache = new Cache<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        let i = 0;
        benchmark(`DWC   set miss ${size.toLocaleString('en')}`, () => cache.set(random() + ++i | 0, {}), done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Clock set hit ${size.toLocaleString('en')}`, function (done) {
        const cache = new Clock<number, object>(size);
        for (let i = 0; i < Math.ceil(size / 32) * 32; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`Clock set hit ${size.toLocaleString('en')}`, () => cache.set(random() * size | 0, {}), done);
      });

      it(`ISC set hit ${size.toLocaleString('en')}`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`ISC   set hit ${size.toLocaleString('en')}`, () => cache.set(random() * size | 0, {}), done);
      });

      it(`LRU set hit ${size.toLocaleString('en')}`, function (done) {
        const cache = new LRU<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`LRU   set hit ${size.toLocaleString('en')}`, () => cache.set(random() * size | 0, {}), done);
      });

      it(`TRC-C set hit ${size.toLocaleString('en')}`, function (done) {
        const cache = new TRCC<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`TRC-C set hit ${size.toLocaleString('en')}`, () => cache.set(random() * size | 0, {}), done);
      });

      it(`TRC-L set hit ${size.toLocaleString('en')}`, function (done) {
        const cache = new TRCL<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`TRC-L set hit ${size.toLocaleString('en')}`, () => cache.set(random() * size | 0, {}), done);
      });

      it(`DWC set hit ${size.toLocaleString('en')}`, function (done) {
        const cache = new Cache<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`DWC   set hit ${size.toLocaleString('en')}`, () => cache.set(random() * size | 0, {}), done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Clock get miss ${size.toLocaleString('en')}`, function (done) {
        const cache = new Clock<number, object>(size);
        for (let i = 0; i < Math.ceil(size / 32) * 32; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        benchmark(`Clock get miss ${size.toLocaleString('en')}`, () => cache.get(random() * size | 0), done);
      });

      it(`ISC get miss ${size.toLocaleString('en')}`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        benchmark(`ISC   get miss ${size.toLocaleString('en')}`, () => cache.get(random() * size | 0), done);
      });

      it(`LRU get miss ${size.toLocaleString('en')}`, function (done) {
        const cache = new LRU<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        benchmark(`LRU   get miss ${size.toLocaleString('en')}`, () => cache.get(random() * size | 0), done);
      });

      it(`TRC-C get miss ${size.toLocaleString('en')}`, function (done) {
        const cache = new TRCC<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        benchmark(`TRC-C get miss ${size.toLocaleString('en')}`, () => cache.get(random() * size | 0), done);
      });

      it(`TRC-L get miss ${size.toLocaleString('en')}`, function (done) {
        const cache = new TRCL<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        benchmark(`TRC-L get miss ${size.toLocaleString('en')}`, () => cache.get(random() * size | 0), done);
      });

      it(`DWC get miss ${size.toLocaleString('en')}`, function (done) {
        const cache = new Cache<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        benchmark(`DWC   get miss ${size.toLocaleString('en')}`, () => cache.get(random() * size | 0), done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Clock get hit ${size.toLocaleString('en')}`, function (done) {
        const cache = new Clock<number, object>(size);
        for (let i = 0; i < Math.ceil(size / 32) * 32; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`Clock get hit ${size.toLocaleString('en')}`, () => cache.get(random() * size | 0), done);
      });

      it(`ISC get hit ${size.toLocaleString('en')}`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`ISC   get hit ${size.toLocaleString('en')}`, () => cache.get(random() * size | 0), done);
      });

      it(`LRU get hit ${size.toLocaleString('en')}`, function (done) {
        const cache = new LRU<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`LRU   get hit ${size.toLocaleString('en')}`, () => cache.get(random() * size | 0), done);
      });

      it(`TRC-C get hit ${size.toLocaleString('en')}`, function (done) {
        const cache = new TRCC<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`TRC-C get hit ${size.toLocaleString('en')}`, () => cache.get(random() * size | 0), done);
      });

      it(`TRC-L get hit ${size.toLocaleString('en')}`, function (done) {
        const cache = new TRCL<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`TRC-L get hit ${size.toLocaleString('en')}`, () => cache.get(random() * size | 0), done);
      });

      it(`DWC get hit ${size.toLocaleString('en')}`, function (done) {
        const cache = new Cache<number, object>(size);
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`DWC   get hit ${size.toLocaleString('en')}`, () => cache.get(random() * size | 0), done);
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
      const bias = (capacity: number, rng: () => number) => () => rng() * capacity * 10 | 0;
      it(`Clock simulation ${size.toLocaleString('en')} 10%`, function (done) {
        const cache = new Clock<number, object>(size);
        const random = bias(Math.ceil(size / 32) * 32, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`Clock simulation ${size.toLocaleString('en')} 10%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`ISC simulation ${size.toLocaleString('en')} 10%`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        const random = bias(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`ISC   simulation ${size.toLocaleString('en')} 10%`, () => {
          const key = random();
          cache.get(key) ?? cache.set(key, {});
        }, done);
      });

      it(`LRU simulation ${size.toLocaleString('en')} 10%`, function (done) {
        const cache = new LRU<number, object>(size);
        const random = bias(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`LRU   simulation ${size.toLocaleString('en')} 10%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`TRC-C simulation ${size.toLocaleString('en')} 10%`, function (done) {
        const cache = new TRCC<number, object>(size);
        const random = bias(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`TRC-C simulation ${size.toLocaleString('en')} 10%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`TRC-L simulation ${size.toLocaleString('en')} 10%`, function (done) {
        const cache = new TRCL<number, object>(size);
        const random = bias(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`TRC-L simulation ${size.toLocaleString('en')} 10%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`DWC simulation ${size.toLocaleString('en')} 10%`, function (done) {
        const cache = new Cache<number, object>(size);
        const random = bias(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`DWC   simulation ${size.toLocaleString('en')} 10%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      const bias = (capacity: number, rng: () => number) => () => rng() * capacity * 2 | 0;
      it(`Clock simulation ${size.toLocaleString('en')} 50%`, function (done) {
        const cache = new Clock<number, object>(size);
        const random = bias(Math.ceil(size / 32) * 32, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`Clock simulation ${size.toLocaleString('en')} 50%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`ISC simulation ${size.toLocaleString('en')} 50%`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        const random = bias(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`ISC   simulation ${size.toLocaleString('en')} 50%`, () => {
          const key = random();
          cache.get(key) ?? cache.set(key, {});
        }, done);
      });

      it(`LRU simulation ${size.toLocaleString('en')} 50%`, function (done) {
        const cache = new LRU<number, object>(size);
        const random = bias(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`LRU   simulation ${size.toLocaleString('en')} 50%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`TRC-C simulation ${size.toLocaleString('en')} 50%`, function (done) {
        const cache = new TRCC<number, object>(size);
        const random = bias(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`TRC-C simulation ${size.toLocaleString('en')} 50%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`TRC-L simulation ${size.toLocaleString('en')} 50%`, function (done) {
        const cache = new TRCL<number, object>(size);
        const random = bias(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`TRC-L simulation ${size.toLocaleString('en')} 50%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`DWC simulation ${size.toLocaleString('en')} 50%`, function (done) {
        const cache = new Cache<number, object>(size);
        const random = bias(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`DWC   simulation ${size.toLocaleString('en')} 50%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      const bias = (capacity: number, rng: () => number) => () => rng() * capacity * 1.1 | 0;
      it(`Clock simulation ${size.toLocaleString('en')} 90%`, function (done) {
        const cache = new Clock<number, object>(size);
        const random = bias(Math.ceil(size / 32) * 32, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`Clock simulation ${size.toLocaleString('en')} 90%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`ISC simulation ${size.toLocaleString('en')} 90%`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        const random = bias(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`ISC   simulation ${size.toLocaleString('en')} 90%`, () => {
          const key = random();
          cache.get(key) ?? cache.set(key, {});
        }, done);
      });

      it(`LRU simulation ${size.toLocaleString('en')} 90%`, function (done) {
        const cache = new LRU<number, object>(size);
        const random = bias(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`LRU   simulation ${size.toLocaleString('en')} 90%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`TRC-C simulation ${size.toLocaleString('en')} 90%`, function (done) {
        const cache = new TRCC<number, object>(size);
        const random = bias(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`TRC-C simulation ${size.toLocaleString('en')} 90%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`TRC-L simulation ${size.toLocaleString('en')} 90%`, function (done) {
        const cache = new TRCL<number, object>(size);
        const random = bias(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`TRC-L simulation ${size.toLocaleString('en')} 90%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`DWC simulation ${size.toLocaleString('en')} 90%`, function (done) {
        const cache = new Cache<number, object>(size);
        const random = bias(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`DWC   simulation ${size.toLocaleString('en')} 90%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      const bias = (capacity: number, rng: () => number) => () => rng() * capacity * 1.1 | 0;
      const age = 1000;
      it(`ISC simulation ${size.toLocaleString('en')} 90% expire`, captureTimers(function (done) {
        const cache = new LRUCache<number, object>({ max: size, ttlAutopurge: true });
        const random = bias(size, xorshift.random(1));
        for (let i = 0; i < size * 9; ++i) cache.set(random(), {});
        for (let i = 0; i < size * 1; ++i) cache.set(i, {}, { ttl: age });
        benchmark(`ISC   simulation ${size.toLocaleString('en')} 90% expire`, () => {
          const key = random();
          cache.get(key) ?? cache.set(key, {}, { ttl: age });
        }, done);
      }));

      it(`DWC simulation ${size.toLocaleString('en')} 90% expire`, function (done) {
        const cache = new Cache<number, object>(size, { eagerExpiration: true });
        const random = bias(size, xorshift.random(1));
        for (let i = 0; i < size * 9; ++i) cache.set(random(), {});
        for (let i = 0; i < size * 1; ++i) cache.set(i, {}, { age: age });
        benchmark(`DWC   simulation ${size.toLocaleString('en')} 90% expire`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {}, { age: age });
        }, done);
      });
    }

  });

});
