import {nat} from '../../../sequence.test';

describe('Unit: lib/monad/sequence/member/take', () => {
  describe('take', () => {
    it('+0', () => {
      assert.deepStrictEqual(
        nat
          .take(0)
          .extract(),
        []);
    });

    it('+1', () => {
      assert.deepStrictEqual(
        nat
          .take(1)
          .extract(),
        [0]);
    });

    it('+2', () => {
      assert.deepStrictEqual(
        nat
          .take(2)
          .extract(),
        [0, 1]);
    });

    it('+3', () => {
      assert.deepStrictEqual(
        nat
          .take(3)
          .extract(),
        [0, 1, 2]);
    });

  });

});
