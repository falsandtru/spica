import { benchmark } from './benchmark';
import { memoize, reduce } from '../src/memoize';
import { Cache } from '../src/cache';

describe('Benchmark:', function () {
  describe('memoize', function () {
    it('Map', function (done) {
      const f = memoize(a => a, new Map());
      let i = 0;
      benchmark('memoize Map', () => f(i = ++i % 1000), done);
    });

    it('Array', function (done) {
      const f = memoize(a => a, []);
      let i = 0;
      benchmark('memoize Array', () => f(i = ++i % 1000), done);
    });

    it('Cache', function (done) {
      const f = memoize(a => a, new Cache(1000));
      let i = 0;
      benchmark('memoize Cache', () => f(i = ++i % 1000), done);
    });
  });

  describe('reduce', function () {
    it('', function (done) {
      const f = reduce(a => a);
      benchmark('reduce', () => f(0), done);
    });
  });

});
