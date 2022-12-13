import { benchmark } from './benchmark';

describe('Benchmark:', function () {
  describe('unshift', function () {
    for (const size of [1, 1e1, 1e2, 1e3]) {
      it(`for ${size.toLocaleString('en')}`, function (done) {
        const as = Array(size).fill(1);
        benchmark(`Array unshift for    ${size.toLocaleString('en')}`, () => {
          const acc = [];
          for (let i = as.length; i-- !== 0;) {
            acc.unshift(as[i]);
          }
        }, done);
      });

      it(`for-of ${size.toLocaleString('en')}`, function (done) {
        const as = Array(size).fill(1);
        benchmark(`Array unshift for-of ${size.toLocaleString('en')}`, () => {
          const acc = [];
          for (const a of as) {
            acc.unshift(a);
          }
        }, done);
      });

      it(`spread ${size.toLocaleString('en')}`, function (done) {
        const as = Array(size).fill(1);
        benchmark(`Array unshift spread ${size.toLocaleString('en')}`, () => {
          const acc = [];
          acc.unshift(...as);
        }, done);
      });
    }
  });

  describe('push', function () {
    for (const size of [1, 1e1, 1e2, 1e3]) {
      it(`for ${size.toLocaleString('en')}`, function (done) {
        const as = Array(size).fill(1);
        benchmark(`Array push for    ${size.toLocaleString('en')}`, () => {
          const acc = [];
          for (let i = 0; i < as.length; ++i) {
            acc.push(as[i]);
          }
        }, done);
      });

      it(`for-of ${size.toLocaleString('en')}`, function (done) {
        const as = Array(size).fill(1);
        benchmark(`Array push for-of ${size.toLocaleString('en')}`, () => {
          const acc = [];
          for (const a of as) {
            acc.push(a);
          }
        }, done);
      });

      it(`spread ${size.toLocaleString('en')}`, function (done) {
        const as = Array(size).fill(1);
        benchmark(`Array push spread ${size.toLocaleString('en')}`, () => {
          const acc = [];
          acc.push(...as);
        }, done);
      });
    }
  });

});
