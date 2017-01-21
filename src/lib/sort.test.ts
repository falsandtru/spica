import { sort } from './sort';
import { Sequence } from './monad/sequence';

describe('Unit: lib/sort', () => {
  describe('sort', () => {

    function cmp(a: number, b: number): number {
      return a - b;
    }

    it('0', () => {
      assert.deepStrictEqual(
        sort([3, 1, 2], cmp, 0, true),
        [3, 1, 2]);
      assert.deepStrictEqual(
        sort([3, 1, 2], cmp, 0),
        [3, 1, 2]);
    });

    it('1', () => {
      assert.deepStrictEqual(
        sort([3, 1, 2], cmp, 1, true),
        [1, 3, 2]);
      assert.deepStrictEqual(
        sort([3, 1, 2], cmp, 1),
        [1, 3, 2]);
    });

    it('2', () => {
      assert.deepStrictEqual(
        sort([3, 1, 2], cmp, 2, true),
        [1, 2, 3]);
      assert.deepStrictEqual(
        sort([3, 1, 2], cmp, 2),
        [1, 2, 3]);
    });

    it('3', () => {
      assert.deepStrictEqual(
        sort([3, 1, 2], cmp, 3, true),
        [1, 2, 3]);
      assert.deepStrictEqual(
        sort([3, 1, 2], cmp, 3),
        [1, 2, 3]);
    });

    it('4', () => {
      assert.deepStrictEqual(
        sort([3, 1, 2], cmp, 4, true),
        [1, 2, 3]);
      assert.deepStrictEqual(
        sort([3, 1, 2], cmp, 4),
        [1, 2, 3]);
    });

    it('Infinity', () => {
      assert.deepStrictEqual(
        sort([3, 1, 2], cmp, Infinity, true),
        [1, 2, 3]);
      assert.deepStrictEqual(
        sort([3, 1, 2], cmp, Infinity),
        [1, 2, 3]);
    });

    it('random', () => {
      const rnd = Sequence.random()
        .map(r => r * 1e3 | 0);
      for (let i = 0; i < 9; ++i) {
        const as = rnd.take(Math.random() * i ** 3).extract();
        assert.deepStrictEqual(
          sort(as.slice(), cmp, Infinity, true),
          as.sort(cmp));
      }
    });

  });

});
