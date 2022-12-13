import { benchmark } from './benchmark';
import { Sequence } from '../src/sequence';

describe('Benchmark:', function () {
  describe('Sequence', function () {
    for (const size of [1, 1e1, 1e2, 1e3]) {
      it(`Sequence take arr  ${size.toLocaleString('en')}`, function (done) {
        const arr = Array(size).fill(0);
        benchmark(`Sequence take arr  ${size.toLocaleString('en')}`, () =>
          arr.slice(0, size), done);
      });

      it(`Sequence take iter ${size.toLocaleString('en')}`, function (done) {
        const seq = Sequence.from(Array(size));
        benchmark(`Sequence take iter ${size.toLocaleString('en')}`, () =>
          seq.extract(), done);
      });

      it(`Sequence take seq  ${size.toLocaleString('en')}`, function (done) {
        const seq = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1)).take(size);
        benchmark(`Sequence take seq  ${size.toLocaleString('en')}`, () =>
          seq.extract(), done);
      });

      it(`Sequence take mem  ${size.toLocaleString('en')}`, function (done) {
        const seq = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1)).take(size).memoize();
        seq.extract();
        benchmark(`Sequence take mem  ${size.toLocaleString('en')}`, () =>
          seq.extract(), done);
      });
    }

    for (const size of [1, 1e1, 1e2, 1e3]) {
      it(`Sequence map filter arr  ${size.toLocaleString('en')}`, function (done) {
        const arr = Array(size).fill(0);
        const f = <T>(n: T) => n;
        const g = () => true;
        benchmark(`Sequence map filter arr  ${size.toLocaleString('en')}`, () =>
          arr.slice(0, size).map(f).filter(g), done);
      });

      it(`Sequence map filter iter ${size.toLocaleString('en')}`, function (done) {
        const seq = Sequence.from(Array(size))
          .map(n => n)
          .filter(() => true)
          .take(size);
        benchmark(`Sequence map filter iter ${size.toLocaleString('en')}`, () =>
          seq.extract(), done);
      });

      it(`Sequence map filter seq  ${size.toLocaleString('en')}`, function (done) {
        const seq = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1))
          .map(n => n)
          .filter(() => true)
          .take(size);
        benchmark(`Sequence map filter seq  ${size.toLocaleString('en')}`, () =>
          seq.extract(), done);
      });
    }

  });

});
