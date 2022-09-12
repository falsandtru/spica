import { benchmark } from './benchmark';

describe('Benchmark:', function () {
  describe('Inline', function () {
    for (const length of [1, 1e1, 1e2]) {
      const arr = Array<number>(length).fill(1);

      it(`for ${length.toLocaleString('en')}`, function (done) {
        benchmark(`for ${length.toLocaleString('en')}`, () => {
          let acc = 0;
          for (let i = 0; i < 1; ++i) {
            acc += arr[i];
          }
          acc;
        }, done);
      });

      it(`Function ${length.toLocaleString('en')}`, function (done) {
        const sum = Function('arr', [
          '"use strict";',
          'return ',
          arr.reduce((acc, _, i) => acc + `+ arr[${i}]`, '').slice(1),
        ].join(''));
        benchmark(`Inline Function ${length.toLocaleString('en')}`, () => sum(arr), done);
      });

      it(`eval ${length.toLocaleString('en')}`, function (done) {
        const sum = eval([
          '() =>',
          arr.reduce((acc, _, i) => acc + `+ arr[${i}]`, '').slice(1),
        ].join(''));
        benchmark(`Inline eval ${length.toLocaleString('en')}`, () => sum(), done);
      });
    }
  });

});
