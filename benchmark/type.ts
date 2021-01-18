import { benchmark } from './benchmark';
import { type, global } from '../';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('type', function () {
    it('undefined', function (done) {
      const { undefined } = global;
      benchmark('type undefined', () => type(undefined), done);
    });

    it('number', function (done) {
      benchmark('type number', () => type(0), done);
    });

    it('function', function (done) {
      const { Function } = global;
      benchmark('type function', () => type(Function), done);
    });

    it('array', function (done) {
      const obj = [] as object;
      benchmark('type array', () => type(obj), done);
    });

    it('object', function (done) {
      const obj = {};
      benchmark('type object', () => type(obj), done);
    });

    it('named', function (done) {
      const obj = new Set();
      benchmark('type named', () => type(obj), done);
    });

  });

});

