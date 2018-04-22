import { nat } from '../../../sequence.test';

describe('Unit: lib/monad/sequence/member/permutations', () => {
  describe('permutations', () => {
    it('0', () => {
      assert.deepStrictEqual(
        nat
          .take(0)
          .permutations()
          .extract(),
        []);
    });

    it('1', () => {
      assert.deepStrictEqual(
        nat
          .take(1)
          .permutations()
          .extract(),
        [[0]]);
    });

    it('2', () => {
      assert.deepStrictEqual(
        nat
          .take(2)
          .permutations()
          .extract(),
        [[0, 1], [1, 0]]);
    });

    it('3', () => {
      assert.deepStrictEqual(
        nat
          .take(3)
          .permutations()
          .extract(),
        [[0, 1, 2], [1, 0, 2], [2, 1, 0], [1, 2, 0], [2, 0, 1], [0, 2, 1]]);
    });

  });

});
