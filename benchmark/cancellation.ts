import { benchmark } from './benchmark';
import { Cancellation } from '..';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Cancellation', function () {
    it('new', function (done) {
      benchmark('Cancellation new', () => new Cancellation(), done);
    });

    it('cancel', function (done) {
      benchmark('Cancellation cancel', () => {
        const c = new Cancellation();
        c.register(() => 0);
        c.cancel();
      }, done);
    });

  });

});
