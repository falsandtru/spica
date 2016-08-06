import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/take', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));

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
