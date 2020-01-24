import { benchmark } from './benchmark';
import { Sequence } from '../';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Sequence', function () {
    this.timeout(100 * 1e3);

    function array(n: number) {
      return Array(n).fill(0).map((_, i) => i);
    }

    function take(n: number) {
      return Promise.resolve()
        .then(() => new Promise(resolve => arrTake(n, resolve)))
        .then(() => new Promise(resolve => iterTake(n, resolve)))
        .then(() => new Promise(resolve => seqTake(n, resolve)))
        .then(() => new Promise(resolve => memTake(n, resolve)));

      function arrTake(n: number, done: () => void) {
        const arr = array(n);
        benchmark(`Sequence take arr  ${n}`, () => arr.slice(0, n), done);
      }
      function iterTake(n: number, done: () => void) {
        const seq = Sequence.from(array(n));
        benchmark(`Sequence take iter ${n}`, () => seq.extract(), done);
      }
      function seqTake(n: number, done: () => void) {
        const seq = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1)).take(n);
        benchmark(`Sequence take seq  ${n}`, () => seq.extract(), done);
      }
      function memTake(n: number, done: () => void) {
        const seq = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1)).take(n).memoize();
        benchmark(`Sequence take mem  ${n}`, () => seq.extract(), done);
      }
    }

    it('take 1', function (done) {
      take(1).then(() => done());
    });

    it('take 10', function (done) {
      take(10).then(() => done());
    });

    it('take 100', function (done) {
      take(100).then(() => done());
    });

    it.skip('take 1000', function (done) {
      take(1000).then(() => done());
    });

    function mapfilter(n: number) {
      return Promise.resolve()
        .then(() => new Promise(resolve => arrMapFilter(n, resolve)))
        .then(() => new Promise(resolve => iterMapFilter(n, resolve)))
        .then(() => new Promise(resolve => seqMapFilter(n, resolve)));

      function arrMapFilter(n: number, done: () => void) {
        const arr = array(n);
        const f = <T>(n: T) => n;
        const g = () => true;
        benchmark(`Sequence map filter arr  ${n}`, () => arr.map(f).filter(g).slice(0, n), done);
      }
      function iterMapFilter(n: number, done: () => void) {
        const seq = Sequence.from(array(n))
          .map(n => n)
          .filter(() => true)
          .take(n);
        benchmark(`Sequence map filter iter ${n}`, () => seq.extract(), done);
      }
      function seqMapFilter(n: number, done: () => void) {
        const seq = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1))
          .map(n => n)
          .filter(() => true)
          .take(n);
        benchmark(`Sequence map filter seq  ${n}`, () => seq.extract(), done);
      }
    }

    it('map filter 1', function (done) {
      mapfilter(1).then(() => done());
    });

    it('map filter 10', function (done) {
      mapfilter(10).then(() => done());
    });

    it('map filter 100', function (done) {
      mapfilter(100).then(() => done());
    });

    it.skip('map filter 1000', function (done) {
      mapfilter(1000).then(() => done());
    });

  });

});
