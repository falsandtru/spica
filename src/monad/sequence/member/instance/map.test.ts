import { nat } from '../../../sequence.test';

describe('Unit: lib/monad/sequence/member/map', () => {
  describe('map', () => {
    it('0', () => {
      assert.deepStrictEqual(
        nat
          .map(String)
          .take(0)
          .extract(),
        [].map(String));
    });

    it('1', () => {
      assert.deepStrictEqual(
        nat
          .map(String)
          .take(1)
          .extract(),
        [0].map(String));
    });

    it('2', () => {
      assert.deepStrictEqual(
        nat
          .map(String)
          .take(2)
          .extract(),
        [0, 1].map(String));
    });

    it('3', () => {
      assert.deepStrictEqual(
        nat
          .map(String)
          .take(3)
          .extract(),
        [0, 1, 2].map(String));
    });

  });

});
