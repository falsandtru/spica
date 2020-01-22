import { benchmark } from './benchmark';
import { AtomicPromise } from '../';

describe('Benchmark:', function () {
  this.timeout(30 * 1e3);

  describe('AtomicPromise', function () {
    it('new', function (done) {
      benchmark('AtomicPromise new', () => new AtomicPromise<number>(resolve => resolve(0)), done);
    });

    it('resolve', function (done) {
      benchmark('AtomicPromise resolve', () => AtomicPromise.resolve(0), done);
    });

    function chain(p: AtomicPromise<number>, n: number) {
      for (let i = 0; i < n; ++i) {
        p = p.then(n => n);
      }
    }
    it('then 1', function (done) {
      const promise = AtomicPromise.resolve(0);
      benchmark(`AtomicPromise then 1`, () => chain(promise, 1), done);
    });

    it('then 10', function (done) {
      const promise = AtomicPromise.resolve(0);
      benchmark(`AtomicPromise then 10`, () => chain(promise, 10), done);
    });

    it('then 100', function (done) {
      const promise = AtomicPromise.resolve(0);
      benchmark(`AtomicPromise then 100`, () => chain(promise, 100), done);
    });

  });

});
