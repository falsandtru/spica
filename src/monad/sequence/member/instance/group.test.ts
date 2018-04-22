import { nat } from '../../../sequence.test';

describe('Unit: lib/monad/sequence/member/group', () => {
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
