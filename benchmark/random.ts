import { benchmark } from './benchmark';
import { rnd16, rnd62, rnd0f, rnd0z, rnd0Z } from '../';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('rnd16', function () {
    it('', function (done) {
      benchmark('random rnd16', () => rnd16(), done);
    });

  });

  describe('rnd62', function () {
    it('', function (done) {
      benchmark('random rnd62', () => rnd62(), done);
    });

  });

  describe('rnd0f', function () {
    it('', function (done) {
      benchmark('random rnd0f', () => rnd0f(), done);
    });

  });

  describe('rnd0z', function () {
    it('', function (done) {
      benchmark('random rnd0z', () => rnd0z(), done);
    });

  });

  describe('rnd0Z', function () {
    it('', function (done) {
      benchmark('random rnd0Z', () => rnd0Z(), done);
    });

  });

  describe('rnd0Z 2', function () {
    it('', function (done) {
      benchmark('random rnd0Z 2', () => rnd0Z(2), done);
    });

  });

  describe('rnd0Z 4', function () {
    it('', function (done) {
      benchmark('random rnd0Z 4', () => rnd0Z(4), done);
    });

  });

});

