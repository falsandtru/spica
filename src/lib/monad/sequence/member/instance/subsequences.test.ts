import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/subsequences', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));

  describe('subsequences', () => {
    it('0', () => {
      assert.deepStrictEqual(
        nat
          .take(0)
          .subsequences()
          .extract(),
        [[]]);
    });

    it('1', () => {
      assert.deepStrictEqual(
        nat
          .take(1)
          .subsequences()
          .extract(),
        [[], [0]]);
    });

    it('2', () => {
      assert.deepStrictEqual(
        nat
          .take(2)
          .subsequences()
          .extract(),
        [[], [0], [1], [0, 1]]);
    });

    it('3', () => {
      assert.deepStrictEqual(
        nat
          .take(3)
          .subsequences()
          .extract(),
        [[], [0], [1], [0, 1], [2], [0, 2], [1, 2], [0, 1, 2]]);
    });

  });

});
