import { replaceParameters, replaceReturn } from './function';

describe('Unit: lib/function', function () {
  describe('replaceParameters', function () {
    it('', () => {
      const f = (a: number, b: number[]) => a * b.length;
      const g = (...ns: number[]) => [ns.reduce((n: number, m: number) => n + m, 0), ns];
      assert(replaceParameters(f, g)() === 0);
      assert(replaceParameters(f, g)(1) === 1);
      assert(replaceParameters(f, g)(1, 2) === 6);
    });

  });

  describe('replaceReturn', function () {
    it('', () => {
      const f = (...ns: number[]) => ns;
      const g = (ns: number[]) => ns.reduce((n: number, m: number) => n + m, 0);
      assert(replaceReturn(f, g)() === 0);
      assert(replaceReturn(f, g)(1) === 1);
      assert(replaceReturn(f, g)(1, 2) === 3);
    });

  });

});
