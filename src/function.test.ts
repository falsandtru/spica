import { reduceParameters, reduceReturns } from './function';

describe('Unit: lib/function', function () {
  describe('reduceParameters', function () {
    it('', () => {
      const f = (a: number) => a * 2;
      const g = (ns: number[]) => ns.reduce((n: number, m: number) => n + m, 0);
      assert(reduceParameters(f, g)() === 0);
      assert(reduceParameters(f, g)(1) === 2);
      assert(reduceParameters(f, g)(1, 2) === 6);
    });

  });

  describe('reduceReturns', function () {
    it('', () => {
      const f = (...ns: number[]) => ns;
      const g = (ns: number[]) => ns.reduce((n: number, m: number) => n + m, 0);
      assert(reduceReturns(f, g)() === 0);
      assert(reduceReturns(f, g)(1) === 1);
      assert(reduceReturns(f, g)(1, 2) === 3);
    });

  });

});
