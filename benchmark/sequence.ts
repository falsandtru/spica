import { benchmark } from './benchmark';
import { Sequence } from '../src/sequence';

describe('Benchmark:', function () {
  describe('Sequence', function () {
    for (const length of [1, 1e1, 1e2, 1e3]) {
      it(`Sequence take arr  ${length.toLocaleString('en')}`, function (done) {
        const arr = Array(length).fill(0);
        benchmark(`Sequence take arr  ${length.toLocaleString('en')}`, () =>
          arr.slice(0, length), done);
      });

      it(`Sequence take iter ${length.toLocaleString('en')}`, function (done) {
        const seq = Sequence.from(Array(length));
        benchmark(`Sequence take iter ${length.toLocaleString('en')}`, () =>
          seq.extract(), done);
      });

      it(`Sequence take seq  ${length.toLocaleString('en')}`, function (done) {
        const seq = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1)).take(length);
        benchmark(`Sequence take seq  ${length.toLocaleString('en')}`, () =>
          seq.extract(), done);
      });

      it(`Sequence take mem  ${length.toLocaleString('en')}`, function (done) {
        const seq = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1)).take(length).memoize();
        seq.extract();
        benchmark(`Sequence take mem  ${length.toLocaleString('en')}`, () =>
          seq.extract(), done);
      });
    }

    for (const length of [1, 1e1, 1e2, 1e3]) {
      it(`Sequence map filter arr  ${length.toLocaleString('en')}`, function (done) {
        const arr = Array(length).fill(0);
        const f = <T>(n: T) => n;
        const g = () => true;
        benchmark(`Sequence map filter arr  ${length.toLocaleString('en')}`, () =>
          arr.slice(0, length).map(f).filter(g), done);
      });

      it(`Sequence map filter iter ${length.toLocaleString('en')}`, function (done) {
        const seq = Sequence.from(Array(length))
          .map(n => n)
          .filter(() => true)
          .take(length);
        benchmark(`Sequence map filter iter ${length.toLocaleString('en')}`, () =>
          seq.extract(), done);
      });

      it(`Sequence map filter seq  ${length.toLocaleString('en')}`, function (done) {
        const seq = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1))
          .map(n => n)
          .filter(() => true)
          .take(length);
        benchmark(`Sequence map filter seq  ${length.toLocaleString('en')}`, () =>
          seq.extract(), done);
      });
    }

  });

});
