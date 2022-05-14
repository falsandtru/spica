import { benchmark } from './benchmark';
import { AtomicFuture } from '../src/future';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('AtomicFuture', function () {
    it('new', function (done) {
      benchmark('AtomicFuture new', () => new AtomicFuture(), done);
    });

    it('bind', function (done) {
      benchmark('AtomicFuture bind', () => new AtomicFuture().bind(void 0), done);
    });

  });

});
