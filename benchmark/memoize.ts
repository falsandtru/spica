import { benchmark } from './benchmark';
import { memoize } from '../src/memoize';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('memoize', function () {
    it('', function (done) {
      const f = memoize(a => a);
      for (let i = 0; i < 1000; ++i) {
        f(i);
      }
      benchmark('memoize', () => f(0), done);
    });

  });

});

