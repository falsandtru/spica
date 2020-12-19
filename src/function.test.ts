import { mapParameters, mapReturn } from './function';

describe('Unit: lib/function', function () {
  describe('mapParameters', function () {
    it('', () => {
      const f = (a: number, b: number[]) => a * b.length;
      const g = (...ns: number[]) => [ns.reduce((n: number, m: number) => n + m, 0), ns];
      assert(mapParameters(f, g)() === 0);
      assert(mapParameters(f, g)(1) === 1);
      assert(mapParameters(f, g)(1, 2) === 6);
    });

  });

  describe('mapReturn', function () {
    it('', () => {
      const f = (...ns: number[]) => ns;
      const g = (ns: number[]) => ns.reduce((n: number, m: number) => n + m, 0);
      assert(mapReturn(f, g)() === 0);
      assert(mapReturn(f, g)(1) === 1);
      assert(mapReturn(f, g)(1, 2) === 3);
    });

  });

});
