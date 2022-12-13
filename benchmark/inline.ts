import { benchmark } from './benchmark';

describe('Benchmark:', function () {
  describe('Inline', function () {
    for (const size of [1, 1e1, 1e2]) {
      const arr = Array<number>(size).fill(1);

      it(`for ${size.toLocaleString('en')}`, function (done) {
        benchmark(`for ${size.toLocaleString('en')}`, () => {
          let acc = 0;
          for (let i = 0; i < size; ++i) {
            acc += arr[i];
          }
          acc;
        }, done);
      });

      it(`Function ${size.toLocaleString('en')}`, function (done) {
        const sum = Function('arr', [
          '"use strict";',
          'return ',
          arr.reduce((acc, _, i) => acc + `+ arr[${i}]`, '').slice(1),
        ].join(''));
        benchmark(`Inline Function ${size.toLocaleString('en')}`, () => sum(arr), done);
      });

      it(`eval ${size.toLocaleString('en')}`, function (done) {
        const sum = eval([
          '() =>',
          arr.reduce((acc, _, i) => acc + `+ arr[${i}]`, '').slice(1),
        ].join(''));
        benchmark(`Inline eval ${size.toLocaleString('en')}`, () => sum(), done);
      });
    }
  });

});
