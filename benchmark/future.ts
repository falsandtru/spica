import { benchmark } from './benchmark';
import { AtomicFuture } from '../src/future';

describe('Benchmark:', function () {
  describe('AtomicFuture', function () {
    it('new', function (done) {
      benchmark('AtomicFuture new', () => new AtomicFuture(), done);
    });

    it('bind', function (done) {
      benchmark('AtomicFuture bind', () => new AtomicFuture().bind(void 0), done);
    });

  });

});
