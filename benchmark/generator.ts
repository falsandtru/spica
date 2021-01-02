import { benchmark } from './benchmark';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('generator', function () {
    function f(as: Iterable<any>) {
      for (const a of as) a;
    }
    function* g(len: number) {
      for (let i = 0; i < len; ++i) {
        yield i;
      }
    }

    it('1', function (done) {
      benchmark('generator 1', () => f(g(1)), done);
    });

    it('10', function (done) {
      benchmark('generator 10', () => f(g(10)), done);
    });

    it('100', function (done) {
      benchmark('generator 100', () => f(g(100)), done);
    });

  });

  describe('array', function () {
    function f(len: number) {
      const acc = [];
      for (let i = 0; i < len; ++i) {
        acc.push(i);
      }
    }

    it('1', function (done) {
      benchmark('array 1', () => f(1), done);
    });

    it('10', function (done) {
      benchmark('array 10', () => f(10), done);
    });

    it('100', function (done) {
      benchmark('array 100', () => f(100), done);
    });

  });

});
