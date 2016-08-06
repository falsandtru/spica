import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/group', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));

  describe('group', () => {
    it('empty', () => {
      assert.deepStrictEqual(
        nat
          .take(0)
          .group(() => true)
          .extract(),
        []);
      assert.deepStrictEqual(
        nat
          .take(0)
          .group(() => false)
          .extract(),
        []);
    });

    it('false', () => {
      assert.deepStrictEqual(
        nat
          .take(3)
          .group(() => false)
          .extract(),
        [[0], [1], [2]]);
    });

    it('true', () => {
      assert.deepStrictEqual(
        nat
          .take(3)
          .group(() => true)
          .extract(),
        [[0, 1, 2]]);
    });

    it('mod3', () => {
      assert.deepStrictEqual(
        nat
          .take(5)
          .group((_, n) => n % 3 > 0)
          .extract(),
        [[0, 1, 2], [3, 4]]);
    });

  });

});
