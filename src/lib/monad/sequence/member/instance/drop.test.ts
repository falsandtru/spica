import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/drop', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));
  const double = nat.map(n => n * 2);
  const triple = nat.map(n => n * 3);

  describe('drop', () => {
    it('-0 +0', () => {
      assert.deepStrictEqual(
        nat
          .drop(0)
          .take(0)
          .read(),
        []);
    });

    it('-0 +1', () => {
      assert.deepStrictEqual(
        nat
          .drop(0)
          .take(1)
          .read(),
        [0]);
    });

    it('-0 +2', () => {
      assert.deepStrictEqual(
        nat
          .drop(0)
          .take(2)
          .read(),
        [0, 1]);
    });

    it('-0 +3', () => {
      assert.deepStrictEqual(
        nat
          .drop(0)
          .take(3)
          .read(),
        [0, 1, 2]);
    });

    it('-1 +3', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(3)
          .read(),
        [1, 2, 3]);
    });

    it('-2 +3', () => {
      assert.deepStrictEqual(
        nat
          .drop(2)
          .take(3)
          .read(),
        [2, 3, 4]);
    });

    it('-3 +3', () => {
      assert.deepStrictEqual(
        nat
          .drop(3)
          .take(3)
          .read(),
        [3, 4, 5]);
    });

  });

});
