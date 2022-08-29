import { benchmark } from './benchmark';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Inline', function () {
    function inline(len: number) {
      return Function('arr', [
        '"use strict";',
        'return 0',
        ...[...Array(len)].map((_, i) => `+ arr[${i}]`),
      ].join(''));
    }

    for (const length of [1, 1e1, 1e2]) {
      it(`for ${length.toLocaleString('en')}`, function (done) {
        benchmark(`for ${length.toLocaleString('en')}`, () => {
          const arr = Array(length).fill(1);
          for (let i = 0; i < 1; ++i) arr[i];
        }, done);
      });

      it(`argument ${length.toLocaleString('en')}`, function (done) {
        const arr = Array(length).fill(1);
        const sum = inline(arr.length)
        benchmark(`Inline argument ${length.toLocaleString('en')}`, () => sum(arr), done);
      });

      it(`reference ${length.toLocaleString('en')}`, function (done) {
        const arr = Array(length).fill(1);
        const sum = eval([
          '() => {',
          '"use strict";',
          'return 0',
          ...arr.map((_, i) => `+ arr[${i}]`),
          '}',
        ].join(''));
        benchmark(`Inline reference ${length.toLocaleString('en')}`, () => sum(), done);
      });
    }
  });

});
