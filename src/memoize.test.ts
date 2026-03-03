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

    it('Cache', () => {
      let cnt = 0;
      const f = memoize<number, number>(key => key + ++cnt, new Cache(9));
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

    it('Array cache', () => {
      let cnt = 0;
      const f = memoize<number, number>(key => key + ++cnt, [], 2 ** 1 - 1);
      assert(f(0) === 1);
      assert(f(0) === 1);
      assert(f(1) === 3);
      assert(f(1) === 3);
      assert(f(2) === 5);
      assert(f(2) === 5);
      assert(f(0) === 4);
      assert(f(0) === 4);
    });

    it('Object cache', () => {
      let cnt = 0;
      const f = memoize<number, number>(key => key + ++cnt, {}, 2 ** 1 - 1);
      assert(f(0) === 1);
      assert(f(0) === 1);
      assert(f(1) === 3);
      assert(f(1) === 3);
      assert(f(2) === 5);
      assert(f(2) === 5);
      assert(f(0) === 4);
      assert(f(0) === 4);
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
