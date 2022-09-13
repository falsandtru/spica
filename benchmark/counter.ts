import { benchmark } from './benchmark';
import { counter } from '../src/counter';

describe('Benchmark:', function () {
  describe('Counter', function () {
    it(`10`, function (done) {
      const count = counter();
      benchmark(`counter 10`, () => count(), done);
    });

    it(`16`, function (done) {
      const count = counter(16);
      benchmark(`counter 16`, () => count(), done);
    });

    it(`36`, function (done) {
      const count = counter(36);
      benchmark(`counter 36`, () => count(), done);
    });

    it(`pad`, function (done) {
      const count = counter(10, '0'.repeat(16));
      benchmark(`counter pad`, () => count(), done);
    });

  });

});
