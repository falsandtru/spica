import { fanOut } from './arrow';

describe('Unit: lib/arrow', function () {
  describe('fanOut', function () {
    it('', () => {
      const a = (s: string) => s.length;
      const b = (s: string) => s.length * 2;
      const c = () => undefined;
      assert.deepStrictEqual(
        fanOut(a)(''),
        [0]);
      assert.deepStrictEqual(
        fanOut(a, s => s)('1'),
        [1, '1']);
      assert.deepStrictEqual(
        fanOut(a, b, a)('1'),
        [1, 2, 1]);
      assert.deepStrictEqual(
        fanOut(c, c)(),
        [undefined, undefined]);
    });

  });

});
