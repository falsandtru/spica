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

    it('over parameters', () => {
      assert([].every(curry(() => false)) === true);
      assert([0].every(curry(() => false)) === false);
      assert([0].every(curry((_: never) => false)) === false);
      assert([0].every(curry((_: never, __: never) => false)) === false);
    });

  });

});
