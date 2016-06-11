import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/take', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));
  const double = nat.map(n => n * 2);
  const triple = nat.map(n => n * 3);

  describe('take', () => {
    it('+0', () => {
      assert.deepStrictEqual(
        nat
          .take(0)
          .read(),
        []);
    });

    it('+1', () => {
      assert.deepStrictEqual(
        nat
          .take(1)
          .read(),
        [0]);
    });

    it('+2', () => {
      assert.deepStrictEqual(
        nat
          .take(2)
          .read(),
        [0, 1]);
    });

    it('+3', () => {
      assert.deepStrictEqual(
        nat
          .take(3)
          .read(),
        [0, 1, 2]);
    });

  });

});
