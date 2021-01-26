import { benchmark } from './benchmark';
import { rnd0Z } from '../src/random';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('indexOf', function () {
    it('10', function (done) {
      const r = `${rnd0Z(9)}-`.split('');
      benchmark('array indexOf 10', () => r.indexOf('-'), done);
    });

    it('100', function (done) {
      const r = `${rnd0Z(99)}-`.split('');
      benchmark('array indexOf 100', () => r.indexOf('-'), done);
    });

    it('1000', function (done) {
      const r = `${rnd0Z(999)}-`.split('');
      benchmark('array indexOf 1000', () => r.indexOf('-'), done);
    });

  });

  describe('for-of', function () {
    function f(arr: any[]) {
      return () => {
        const acc = [];
        for (const a of arr) {
          acc.push(a);
        }
      };
    }

    it('1', function (done) {
      benchmark('array push for-of 1', f(Array(1).fill(1)), done);
    });

    it('10', function (done) {
      benchmark('array push for-of 10', f(Array(10).fill(1)), done);
    });

    it('100', function (done) {
      benchmark('array push for-of 100', f(Array(100).fill(1)), done);
    });

  });

  describe('spread', function () {
    function f(arr: any[]) {
      return () => {
        const acc = [];
        acc.push(...arr);
      };
    }

    it('1', function (done) {
      benchmark('array push spread 1', f(Array(1).fill(1)), done);
    });

    it('10', function (done) {
      benchmark('array push spread 10', f(Array(10).fill(1)), done);
    });

    it('100', function (done) {
      benchmark('array push spread 100', f(Array(100).fill(1)), done);
    });

  });

});
