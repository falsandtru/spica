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

    it('ILRU new', function (done) {
      benchmark('ILRU  new', () => new LRUCache({ max: 10000 }), done);
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

    for (const size of [1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Clock set miss ${size.toLocaleString('en')}`, function (done) {
        const cache = new Clock<number, object>(size);
        for (let i = 0; i < Math.ceil(size / 32) * 32; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        let i = 0;
        benchmark(`Clock set miss ${size.toLocaleString('en')}`, () => cache.set(random() + ++i | 0, {}), done);
      });

      it(`ILRU set miss ${size.toLocaleString('en')}`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        let i = 0;
        benchmark(`ILRU  set miss ${size.toLocaleString('en')}`, () => cache.set(random() + ++i | 0, {}), done);
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

    for (const size of [1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Clock set hit ${size.toLocaleString('en')}`, function (done) {
        const cache = new Clock<number, object>(size);
        for (let i = 0; i < Math.ceil(size / 32) * 32; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`Clock set hit ${size.toLocaleString('en')}`, () => cache.set(random() * size | 0, {}), done);
      });

      it(`ILRU set hit ${size.toLocaleString('en')}`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`ILRU  set hit ${size.toLocaleString('en')}`, () => cache.set(random() * size | 0, {}), done);
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

    for (const size of [1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Clock get miss ${size.toLocaleString('en')}`, function (done) {
        const cache = new Clock<number, object>(size);
        for (let i = 0; i < Math.ceil(size / 32) * 32; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        benchmark(`Clock get miss ${size.toLocaleString('en')}`, () => cache.get(random() * size | 0), done);
      });

      it(`ILRU get miss ${size.toLocaleString('en')}`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        for (let i = 0; i < size; ++i) cache.set(~i, {});
        const random = xorshift.random(1);
        benchmark(`ILRU  get miss ${size.toLocaleString('en')}`, () => cache.get(random() * size | 0), done);
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

    for (const size of [1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Clock get hit ${size.toLocaleString('en')}`, function (done) {
        const cache = new Clock<number, object>(size);
        for (let i = 0; i < Math.ceil(size / 32) * 32; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`Clock get hit ${size.toLocaleString('en')}`, () => cache.get(random() * size | 0), done);
      });

      it(`ILRU get hit ${size.toLocaleString('en')}`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        for (let i = 0; i < size; ++i) cache.set(i, {});
        const random = xorshift.random(1);
        benchmark(`ILRU  get hit ${size.toLocaleString('en')}`, () => cache.get(random() * size | 0), done);
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

    // 遅いZipfを速い疑似関数で代用し偏りを再現する。
    // ILRUのリストをインデクスで置き換える高速化手法はZipfのような
    // 最も典型的な偏りのアクセスパターンで50%以下の速度に低速化する場合がある。
    for (const size of [1e2, 1e3, 1e4, 1e5, 1e6]) {
      const pzipf = (capacity: number, rng: () => number) => () =>
        Math.floor((rng() * capacity) ** 2 / (5 * capacity / 100 | 0));
      it(`Clock simulation ${size.toLocaleString('en')} 10%`, function (done) {
        const cache = new Clock<number, object>(size);
        const random = pzipf(Math.ceil(size / 32) * 32, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`Clock simulation ${size.toLocaleString('en')} 10%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`ILRU simulation ${size.toLocaleString('en')} 10%`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        const random = pzipf(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`ILRU  simulation ${size.toLocaleString('en')} 10%`, () => {
          const key = random();
          cache.get(key) ?? cache.set(key, {});
        }, done);
      });

      it(`LRU simulation ${size.toLocaleString('en')} 10%`, function (done) {
        const cache = new LRU<number, object>(size);
        const random = pzipf(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`LRU   simulation ${size.toLocaleString('en')} 10%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`TRC-C simulation ${size.toLocaleString('en')} 10%`, function (done) {
        const cache = new TRCC<number, object>(size);
        const random = pzipf(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`TRC-C simulation ${size.toLocaleString('en')} 10%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`TRC-L simulation ${size.toLocaleString('en')} 10%`, function (done) {
        const cache = new TRCL<number, object>(size);
        const random = pzipf(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`TRC-L simulation ${size.toLocaleString('en')} 10%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`DWC simulation ${size.toLocaleString('en')} 10%`, function (done) {
        const cache = new Cache<number, object>(size);
        const random = pzipf(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`DWC   simulation ${size.toLocaleString('en')} 10%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });
    }

    for (const size of [1e2, 1e3, 1e4, 1e5, 1e6]) {
      const pzipf = (capacity: number, rng: () => number) => () =>
        Math.floor((rng() * capacity) ** 2 / (35 * capacity / 100 | 0));
      it(`Clock simulation ${size.toLocaleString('en')} 50%`, function (done) {
        const cache = new Clock<number, object>(size);
        const random = pzipf(Math.ceil(size / 32) * 32, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`Clock simulation ${size.toLocaleString('en')} 50%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`ILRU simulation ${size.toLocaleString('en')} 50%`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        const random = pzipf(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`ILRU  simulation ${size.toLocaleString('en')} 50%`, () => {
          const key = random();
          cache.get(key) ?? cache.set(key, {});
        }, done);
      });

      it(`LRU simulation ${size.toLocaleString('en')} 50%`, function (done) {
        const cache = new LRU<number, object>(size);
        const random = pzipf(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`LRU   simulation ${size.toLocaleString('en')} 50%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`TRC-C simulation ${size.toLocaleString('en')} 50%`, function (done) {
        const cache = new TRCC<number, object>(size);
        const random = pzipf(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`TRC-C simulation ${size.toLocaleString('en')} 50%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`TRC-L simulation ${size.toLocaleString('en')} 50%`, function (done) {
        const cache = new TRCL<number, object>(size);
        const random = pzipf(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`TRC-L simulation ${size.toLocaleString('en')} 50%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`DWC simulation ${size.toLocaleString('en')} 50%`, function (done) {
        const cache = new Cache<number, object>(size);
        const random = pzipf(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`DWC   simulation ${size.toLocaleString('en')} 50%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });
    }

    for (const size of [1e2, 1e3, 1e4, 1e5, 1e6]) {
      const pzipf = (capacity: number, rng: () => number) => () =>
        Math.floor((rng() * capacity) ** 2 / (85 * capacity / 100 | 0));
      it(`Clock simulation ${size.toLocaleString('en')} 90%`, function (done) {
        const cache = new Clock<number, object>(size);
        const random = pzipf(Math.ceil(size / 32) * 32, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`Clock simulation ${size.toLocaleString('en')} 90%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`ILRU simulation ${size.toLocaleString('en')} 90%`, function (done) {
        const cache = new LRUCache<number, object>({ max: size });
        const random = pzipf(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`ILRU  simulation ${size.toLocaleString('en')} 90%`, () => {
          const key = random();
          cache.get(key) ?? cache.set(key, {});
        }, done);
      });

      it(`LRU simulation ${size.toLocaleString('en')} 90%`, function (done) {
        const cache = new LRU<number, object>(size);
        const random = pzipf(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`LRU   simulation ${size.toLocaleString('en')} 90%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`TRC-C simulation ${size.toLocaleString('en')} 90%`, function (done) {
        const cache = new TRCC<number, object>(size);
        const random = pzipf(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`TRC-C simulation ${size.toLocaleString('en')} 90%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`TRC-L simulation ${size.toLocaleString('en')} 90%`, function (done) {
        const cache = new TRCL<number, object>(size);
        const random = pzipf(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`TRC-L simulation ${size.toLocaleString('en')} 90%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });

      it(`DWC simulation ${size.toLocaleString('en')} 90%`, function (done) {
        const cache = new Cache<number, object>(size);
        const random = pzipf(size, xorshift.random(1));
        for (let i = 0; i < size * 10; ++i) cache.set(random(), {});
        benchmark(`DWC   simulation ${size.toLocaleString('en')} 90%`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {});
        }, done);
      });
    }

    for (const size of [1e2, 1e3, 1e4, 1e5, 1e6]) {
      const pzipf = (capacity: number, rng: () => number) => () =>
        Math.floor((rng() * capacity) ** 2 / (85 * capacity / 100 | 0));
      const age = 1000;
      it(`ILRU simulation ${size.toLocaleString('en')} 90% expire`, captureTimers(function (done) {
        const cache = new LRUCache<number, object>({ max: size, ttlAutopurge: true });
        const random = pzipf(size, xorshift.random(1));
        for (let i = 0; i < size * 9; ++i) cache.set(random(), {});
        for (let i = 0; i < size * 1; ++i) cache.set(random(), {}, { ttl: age });
        benchmark(`ILRU  simulation ${size.toLocaleString('en')} 90% expire`, () => {
          const key = random();
          cache.get(key) ?? cache.set(key, {}, { ttl: age });
        }, done);
      }));

      it(`DWC simulation ${size.toLocaleString('en')} 90% expire`, function (done) {
        const cache = new Cache<number, object>(size, { eagerExpiration: true });
        const random = pzipf(size, xorshift.random(1));
        for (let i = 0; i < size * 9; ++i) cache.set(random(), {});
        for (let i = 0; i < size * 1; ++i) cache.set(random(), {}, { age: age });
        benchmark(`DWC   simulation ${size.toLocaleString('en')} 90% expire`, () => {
          const key = random();
          cache.get(key) ?? cache.add(key, {}, { age: age });
        }, done);
      });
    }

  });

});
