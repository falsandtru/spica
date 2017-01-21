import {nat} from '../../../sequence.test';

describe('Unit: lib/monad/sequence/member/drop', () => {
  describe('drop', () => {
    it('-0 +0', () => {
      assert.deepStrictEqual(
        nat
          .drop(0)
          .take(0)
          .extract(),
        []);
    });

    it('-0 +1', () => {
      assert.deepStrictEqual(
        nat
          .drop(0)
          .take(1)
          .extract(),
        [0]);
    });

    it('-0 +2', () => {
      assert.deepStrictEqual(
        nat
          .drop(0)
          .take(2)
          .extract(),
        [0, 1]);
    });

    it('-0 +3', () => {
      assert.deepStrictEqual(
        nat
          .drop(0)
          .take(3)
          .extract(),
        [0, 1, 2]);
    });

    it('-1 +3', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(3)
          .extract(),
        [1, 2, 3]);
    });

    it('-2 +3', () => {
      assert.deepStrictEqual(
        nat
          .drop(2)
          .take(3)
          .extract(),
        [2, 3, 4]);
    });

    it('-3 +3', () => {
      assert.deepStrictEqual(
        nat
          .drop(3)
          .take(3)
          .extract(),
        [3, 4, 5]);
    });

  });

});
