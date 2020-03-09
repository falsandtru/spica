import { curry, uncurry } from './curry';

describe('Unit: lib/curry', () => {
  describe('curry', () => {
    it('1', () => {
      assert(curry((a: number) => a)(1) === 1);
    });

    it('2', () => {
      assert(curry((a: number, b: number) => a + b)(1)(2) === 3);
      assert(curry((a: number, b: number) => a + b)(1, 2) === 3);
    });

    it('3', () => {
      assert(curry((a: number, b: number, c: number) => a + b + c)(1)(2)(3) === 6);
      assert(curry((a: number, b: number, c: number) => a + b + c)(1, 2)(3) === 6);
      assert(curry((a: number, b: number, c: number) => a + b + c)(1)(2, 3) === 6);
      assert(curry((a: number, b: number, c: number) => a + b + c)(1, 2, 3) === 6);
    });

    it('extra parameters', () => {
      assert.deepStrictEqual([1].map(curry((a: number) => a)), [1]);
      assert.deepStrictEqual([1].map(curry((a: number, b: number = NaN) => [a, b])), [[1, 0]]);
    });

    it('recursive', () => {
      assert(curry(curry((a: number) => a))(1) === 1);
      assert(curry(curry((a: number, b: number) => a + b))(1)(2) === 3);
      assert(curry(curry((a: number, b: number) => a + b)(1))(2) === 3);
    });

    it('generic', () => {
      assert(curry(<T extends 1, U extends 2>(a: T, b: U) => a + b)(1)(2) === 3);
      assert(curry(<T extends 1, U extends 2>(a: T, b: U) => a + b)(1, 2) === 3);
    });

  });

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
