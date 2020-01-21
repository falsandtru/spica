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

    function chain(n: number, done: () => void) {
      benchmark(`AtomicPromise then ${n}`, () => {
        let promise: AtomicPromise<number> = new AtomicPromise(resolve => resolve(0));
        for (let i = 0; i < n; ++i) {
          promise = promise.then(n => n);
        }
      }, done);
    }
    it('then 1', function (done) {
      chain(1, done);
    });

    it('then 10', function (done) {
      chain(10, done);
    });

    it('then 100', function (done) {
      chain(100, done);
    });

  });

});
