import { uncurry } from './uncurry';

describe('Unit: lib/uncurry', () => {
  describe('uncurry', () => {
    it('1', () => {
      assert(uncurry((a: number) => a)([1]) === 1);
    });

    it('2', () => {
      assert(uncurry((a: number, b: number) => a + b)([1, 2]) === 3);
    });

    it('3', () => {
      assert(uncurry((a: number, b: number, c: number) => a + b + c)([1, 2, 3]) === 6);
    });

  });

});
