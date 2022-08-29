import { benchmark } from './benchmark';
import { rnd0Z } from '../src/random';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('indexOf', function () {
    for (const length of [1e1, 1e2, 1e3, 1e4]) {
      it(length.toLocaleString('en'), function (done) {
        const r = `${rnd0Z(length - 1)}-`;
        benchmark(`string indexOf ${length.toLocaleString('en')}`, () => r.indexOf('-'), done);
      });
    }

  });

});
