import { uncurry } from './uncurry';

describe('Unit: lib/uncurry', () => {
  describe('uncurry', () => {
    it('1', () => {
      assert.deepStrictEqual(
        uncurry((a: number) => [a])(1),
        [1]);
    });

    it('2', () => {
      assert.deepStrictEqual(
        uncurry((a: number) => (b: number) => [a, b])(1, 2),
        [1, 2]);
    });

    it('3', () => {
      assert.deepStrictEqual(
        uncurry((a: number) => (b: number) => (c: number) => [a, b, c])(1, 2, 3),
        [1, 2, 3]);
    });

  });

});
