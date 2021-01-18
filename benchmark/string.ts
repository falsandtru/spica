import { benchmark } from './benchmark';
import { rnd0Z } from '../src/random';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('indexOf', function () {
    it('10', function (done) {
      const r = `${rnd0Z(9)}-`;
      benchmark('string indexOf 10', () => r.indexOf('-'), done);
    });

    it('100', function (done) {
      const r = `${rnd0Z(99)}-`;
      benchmark('string indexOf 100', () => r.indexOf('-'), done);
    });

    it('1000', function (done) {
      const r = `${rnd0Z(999)}-`;
      benchmark('string indexOf 1000', () => r.indexOf('-'), done);
    });

    it('10000', function (done) {
      const r = `${rnd0Z(9999)}-`;
      benchmark('string indexOf 10000', () => r.indexOf('-'), done);
    });

  });

});
