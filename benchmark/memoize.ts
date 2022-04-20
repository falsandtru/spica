import { benchmark } from './benchmark';
import { memoize, reduce, Cache } from '../';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('memoize', function () {
    it('Map', function (done) {
      const f = memoize(a => a, new Map());
      for (let i = 0; i < 1000; ++i) {
        f(i);
      }
      let i = 0;
      benchmark('memoize Map', () => f(i = ++i % 1000), done);
    });

    it('Cache', function (done) {
      const f = memoize(a => a, new Cache(1000));
      for (let i = 0; i < 1000; ++i) {
        f(i);
      }
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
