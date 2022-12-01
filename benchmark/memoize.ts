import { benchmark } from './benchmark';
import { memoize, reduce } from '../src/memoize';
import { Clock } from '../src/clock';
import { Cache } from '../src/cache';

describe('Benchmark:', function () {
  describe('memoize', function () {
    for (const exp of [10, 12, 14, 16, 18, 20]) {
      const size = 1 << exp;
      const mask = size - 1;

      it(`Map   ${size.toLocaleString('en')}`, function (done) {
        const f = memoize(a => a, new Map());
        let i = 0;
        benchmark(`memoize Map   ${size.toLocaleString('en')}`, () => f(i = ++i & mask), done);
      });

      it(`Array ${size.toLocaleString('en')}`, function (done) {
        const f = memoize(a => a, []);
        let i = 0;
        benchmark(`memoize Array ${size.toLocaleString('en')}`, () => f(i = ++i & mask), done);
      });

      it(`Clock ${size.toLocaleString('en')}`, function (done) {
        const f = memoize(a => a, new Clock(size));
        let i = 0;
        benchmark(`memoize Clock ${size.toLocaleString('en')}`, () => f(i = ++i & mask), done);
      });

      it(`Cache ${size.toLocaleString('en')}`, function (done) {
        const f = memoize(a => a, new Cache(size));
        let i = 0;
        benchmark(`memoize Cache ${size.toLocaleString('en')}`, () => f(i = ++i & mask), done);
      });
    }
  });

  describe('reduce', function () {
    it('', function (done) {
      const f = reduce(a => a);
      benchmark('reduce', () => f(0), done);
    });
  });

});
