import { curry } from './curry';

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

  });

});
