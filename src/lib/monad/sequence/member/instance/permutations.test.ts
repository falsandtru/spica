import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/permutations', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));

  describe('permutations', () => {
    it('0', () => {
      assert.deepStrictEqual(
        nat
          .take(0)
          .permutations()
          .read(),
        []);
    });

    it('1', () => {
      assert.deepStrictEqual(
        nat
          .take(1)
          .permutations()
          .read(),
        [[0]]);
    });

    it('2', () => {
      assert.deepStrictEqual(
        nat
          .take(2)
          .permutations()
          .read(),
        [[0, 1], [1, 0]]);
    });

    it('3', () => {
      assert.deepStrictEqual(
        nat
          .take(3)
          .permutations()
          .read(),
        [[0, 1, 2], [1, 0, 2], [2, 1, 0], [1, 2, 0], [2, 0, 1], [0, 2, 1]]);
    });

  });

});
