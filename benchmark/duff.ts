import { benchmark } from './benchmark';
import { duff, duffbk, duffEach, duffReduce } from '../src/duff';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('for', function () {
    for (const length of [1, 1e1, 1e2, 1e3, 1e4]) {
      it(`for ${length.toLocaleString('en')}`, function (done) {
        benchmark(`for ${length.toLocaleString('en')}`, () => {
          for (let i = 0; i < length; ++i);
        }, done);
      });

      it(`duff ${length.toLocaleString('en')}`, function (done) {
        benchmark(`duff ${length.toLocaleString('en')}`, () => duff(1, i => i), done);
      });

      it(`duffbk ${length.toLocaleString('en')}`, function (done) {
        benchmark(`duffbk ${length.toLocaleString('en')}`, () => duffbk(1, i => i), done);
      });

      it(`duffEach ${length.toLocaleString('en')}`, function (done) {
        const as = Array(length).fill(0);
        benchmark(`duffEach ${length.toLocaleString('en')}`, () => duffEach(as, v => v), done);
      });

      it(`duffReduce ${length.toLocaleString('en')}`, function (done) {
        const as = Array(length).fill(0);
        benchmark(`duffReduce ${length.toLocaleString('en')}`, () => duffReduce(as, v => v, 0), done);
      });
    }

  });

});
