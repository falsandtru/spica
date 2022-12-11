import { benchmark } from './benchmark';
import { rnd16, rnd62, rnd0f, rnd0Z, unique, xorshift, pcg32 } from '../src/random';

describe('Benchmark:', function () {
  describe('Uint8Array', function () {
    it('256', function (done) {
      const buf = new Uint8Array(256);
      benchmark('random Uint8Array 256', () => crypto.getRandomValues(buf), done);
    });

    it('512', function (done) {
      const buf = new Uint8Array(512);
      benchmark('random Uint8Array 512', () => crypto.getRandomValues(buf), done);
    });

  });

  describe('Uint16Array', function () {
    it('256', function (done) {
      const buf = new Uint16Array(256);
      benchmark('random Uint16Array 256', () => crypto.getRandomValues(buf), done);
    });

    it('512', function (done) {
      const buf = new Uint16Array(512);
      benchmark('random Uint16Array 512', () => crypto.getRandomValues(buf), done);
    });

  });

  describe('Uint32Array', function () {
    it('256', function (done) {
      const buf = new Uint32Array(256);
      benchmark('random Uint32Array 256', () => crypto.getRandomValues(buf), done);
    });

    it('512', function (done) {
      const buf = new Uint32Array(512);
      benchmark('random Uint32Array 512', () => crypto.getRandomValues(buf), done);
    });

  });

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

  describe('rnd0Z', function () {
    it('1', function (done) {
      benchmark('random rnd0Z 1', () => rnd0Z(), done);
    });

    it('2', function (done) {
      benchmark('random rnd0Z 2', () => rnd0Z(2), done);
    });

    it('4', function (done) {
      benchmark('random rnd0Z 4', () => rnd0Z(4), done);
    });

  });

  describe('unique', function () {
    it('', function (done) {
      const rng = unique(rnd0Z, 1);
      benchmark('random unique', () => rng(), done);
    });

  });

  describe('Math.random', function () {
    it('', function (done) {
      const rng = Math.random;
      benchmark('random Math.random', () => rng(), done);
    });

  });

  describe('xorshift', function () {
    it('', function (done) {
      const rng = xorshift.random();
      benchmark('random xorshift', () => rng(), done);
    });

  });

  describe('pcg32', function () {
    it('', function (done) {
      const rng = pcg32.random();
      benchmark('random pcg32', () => rng(), done);
    });

  });

});
