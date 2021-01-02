import { benchmark } from './benchmark';
import { duff, duffbk } from '../src/duff';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('for', function () {
    it('1', function (done) {
      benchmark('for 1', () => {
        for (let i = 0; i < 1; ++i);
      }, done);
    });

    it('10', function (done) {
      benchmark('for 10', () => {
        for (let i = 0; i < 10; ++i);
      }, done);
    });

    it('100', function (done) {
      benchmark('for 100', () => {
        for (let i = 0; i < 100; ++i);
      }, done);
    });

  });

  describe('duff', function () {
    it('1', function (done) {
      benchmark('duff 1', () => duff(1, i => i), done);
    });

    it('10', function (done) {
      benchmark('duff 10', () => duff(10, i => i), done);
    });

    it('100', function (done) {
      benchmark('duff 100', () => duff(100, i => i), done);
    });

  });

  describe('duffbk', function () {
    it('1', function (done) {
      benchmark('duffbk 1', () => duffbk(1, i => i), done);
    });

    it('10', function (done) {
      benchmark('duffbk 10', () => duffbk(10, i => i), done);
    });

    it('100', function (done) {
      benchmark('duffbk 100', () => duffbk(100, i => i), done);
    });

  });

});
