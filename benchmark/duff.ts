import { benchmark } from './benchmark';
import { duff, duffbk, duffEach, duffReduce } from '../src/duff';

describe('Benchmark:', function () {
  describe('Duff', function () {
    for (const size of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`for ${size.toLocaleString('en')}`, function (done) {
        benchmark(`for ${size.toLocaleString('en')}`, () => {
          for (let i = 0; i < size; ++i);
        }, done);
      });

      it(`duff ${size.toLocaleString('en')}`, function (done) {
        benchmark(`duff ${size.toLocaleString('en')}`, () => duff(size, i => i), done);
      });

      it(`duffbk ${size.toLocaleString('en')}`, function (done) {
        benchmark(`duffbk ${size.toLocaleString('en')}`, () => duffbk(size, i => i), done);
      });

      it(`for array ${size.toLocaleString('en')}`, function (done) {
        const as = Array(size).fill(0);
        benchmark(`for array ${size.toLocaleString('en')}`, () => {
          for (let i = 0; i < size; ++i) as[i];
        }, done);
      });

      it(`duff array ${size.toLocaleString('en')}`, function (done) {
        const as = Array(size).fill(0);
        benchmark(`duff array ${size.toLocaleString('en')}`, () => duff(as.length, i => as[i]), done);
        //benchmark(`duff array ${size.toLocaleString('en')}`, () => duffbk(as.length, i => as[i]), done);
      });

      it(`duffEach ${size.toLocaleString('en')}`, function (done) {
        const as = Array(size).fill(0);
        benchmark(`duffEach ${size.toLocaleString('en')}`, () => duffEach(as, v => v), done);
      });

      it(`duffReduce ${size.toLocaleString('en')}`, function (done) {
        const as = Array(size).fill(0);
        benchmark(`duffReduce ${size.toLocaleString('en')}`, () => duffReduce(as, v => v, 0), done);
      });
    }

  });

});
