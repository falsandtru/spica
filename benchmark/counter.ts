import { benchmark } from './benchmark';
import { counter } from '../src/counter';

describe('Benchmark:', function () {
  describe('Counter', function () {
    for (const radix of [10, 16, 32, 36]) {
      it(`native ${radix.toLocaleString('en')}`, function (done) {
        let i = 0;
        benchmark(`Counter native ${radix.toLocaleString('en')}`, () =>
          (++i).toString(radix), done);
      });

      it(`custom ${radix.toLocaleString('en')}`, function (done) {
        const count = counter(radix);
        benchmark(`Counter custom ${radix.toLocaleString('en')}`, () =>
          count(), done);
      });
    }

    it(`pad`, function (done) {
      const count = counter(10, '0'.repeat(16));
      benchmark(`counter pad`, () => count(), done);
    });

  });

});
