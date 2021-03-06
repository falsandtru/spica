import { bundle, aggregate } from './arrow';

describe('Unit: lib/arrow', function () {
  describe('bundle', function () {
    it('', () => {
      const a = (s: string) => s;
      const b = (n: number) => n * 2;
      const c = () => undefined;
      assert.deepStrictEqual(
        bundle(a)(''),
        ['']);
      assert.deepStrictEqual(
        bundle(a, b)('1', 2),
        ['1', 4]);
      assert.deepStrictEqual(
        bundle(a, b, c, s => s)('1', 2, undefined, ''),
        ['1', 4, undefined, '']);
    });

  });

  describe('aggregate', function () {
    it('', () => {
      const a = (s: string) => s;
      const b = (s: string) => s.length * 2;
      const c = () => undefined;
      assert.deepStrictEqual(
        aggregate(a)(''),
        ['']);
      assert.deepStrictEqual(
        aggregate(a, b)('1'),
        ['1', 2]);
      assert.deepStrictEqual(
        aggregate(a, b, c, s => s)('1'),
        ['1', 2, undefined, '1']);
      assert.deepStrictEqual(
        aggregate(c, c)(),
        [undefined, undefined]);
    });

  });

});
