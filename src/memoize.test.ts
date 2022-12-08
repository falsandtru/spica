import { memoize, reduce } from './memoize';
import { Cache } from './cache';

describe('Unit: lib/memoize', () => {
  describe('memoize', () => {
    it('Map', () => {
      let cnt = 0;
      const f = memoize<number, number>(key => key + ++cnt);
      assert(f(0) === 1);
      assert(f(0) === 1);
    });

    it('Array', () => {
      let cnt = 0;
      const f = memoize<number, number>(key => key + ++cnt, []);
      assert(f(0) === 1);
      assert(f(0) === 1);
    });

    it('Object', () => {
      let cnt = 0;
      const f = memoize<number, number>(key => key + ++cnt, {});
      assert(f(0) === 1);
      assert(f(0) === 1);
    });

    it('Cache', () => {
      let cnt = 0;
      const f = memoize<number, number>(key => key + ++cnt, new Cache(9));
      assert(f(0) === 1);
      assert(f(0) === 1);
    });
  });

  describe('reduce', () => {
    it('', () => {
      let cnt = 0;
      const f = reduce<number, number>(key => key + ++cnt);
      assert(f(0) === 1);
      assert(f(0) === 1);
    });
  });

});
