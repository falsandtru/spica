import { benchmark } from './benchmark';
import { rnd16, rnd62, rnd0f, rnd0Z, unique } from '../';
import { crypto } from '../src/global';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

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

  describe('unique', function () {
    it('', function (done) {
      const rnd = unique(rnd0Z, 1);
      benchmark('random unique', () => rnd(), done);
    });

  });

});

