import { benchmark } from './benchmark';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('for acc', function () {
    it('1', function (done) {
      benchmark('for acc 1', () => {
        let acc = 0;
        for (let i = 0; i < 1; ++i) acc += i;
        return acc;
      }, done);
    });

    it('10', function (done) {
      benchmark('for acc 10', () => {
        let acc = 0;
        for (let i = 0; i < 10; ++i) acc += i;
        return acc;
      }, done);
    });

    it('100', function (done) {
      benchmark('for acc 100', () => {
        let acc = 0;
        for (let i = 0; i < 100; ++i) acc += i;
        return acc;
      }, done);
    });

  });

  describe('inline argument', function () {
    function inline(len: number) {
      return Function('arr', [
        '"use strict";',
        'return 0',
        ...[...Array(len)].map((_, i) => `+ arr[${i}]`),
      ].join(''));
    }

    it('1', function (done) {
      const arr = Array(1).fill(1);
      const sum = inline(arr.length)
      benchmark('inline argument 1', () => sum(arr), done);
    });

    it('10', function (done) {
      const arr = Array(10).fill(1);
      const sum = inline(arr.length)
      benchmark('inline argument 10', () => sum(arr), done);
    });

    it('100', function (done) {
      const arr = Array(100).fill(1);
      const sum = inline(arr.length)
      benchmark('inline argument 100', () => sum(arr), done);
    });

  });

  describe('inline reference', function () {
    it('1', function (done) {
      const arr = Array(1).fill(1);
      const sum = eval([
        '() => {',
        '"use strict";',
        'return 0',
        ...arr.map((_, i) => `+ arr[${i}]`),
        '}',
      ].join(''));
      benchmark('inline reference 1', () => sum(), done);
    });

    it('10', function (done) {
      const arr = Array(10).fill(1);
      const sum = eval([
        '() => {',
        '"use strict";',
        'return 0',
        ...arr.map((_, i) => `+ arr[${i}]`),
        '}',
      ].join(''));
      benchmark('inline reference 10', () => sum(), done);
    });

    it('100', function (done) {
      const arr = Array(100).fill(1);
      const sum = eval([
        '() => {',
        '"use strict";',
        'return 0',
        ...arr.map((_, i) => `+ arr[${i}]`),
        '}',
      ].join(''));
      benchmark('inline reference 100', () => sum(), done);
    });

  });

});
