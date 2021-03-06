import { benchmark } from './benchmark';
import { ObjectGetPrototypeOf, hasOwnProperty } from '../';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('ObjectGetPrototypeOf', function () {
    it('', function (done) {
      const obj = {};
      benchmark('alias ObjectGetPrototypeOf', () => ObjectGetPrototypeOf(obj), done);
    });

  });

  describe('hasOwnProperty', function () {
    const obj = { 0: 0 };

    it('miss', function (done) {
      benchmark('alias hasOwnProperty miss', () => hasOwnProperty(obj, ''), done);
    });

    it('match', function (done) {
      benchmark('alias hasOwnProperty match', () => hasOwnProperty(obj, '0'), done);
    });

  });

});
