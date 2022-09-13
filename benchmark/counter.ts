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

  });

});
