import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/filter', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));

  describe('filter', () => {
    it('0', () => {
      assert.deepStrictEqual(
        nat
          .filter(n => n % 2 === 0)
          .take(0)
          .read(),
        []);
    });

    it('1', () => {
      assert.deepStrictEqual(
        nat
          .filter(n => n % 2 === 0)
          .take(1)
          .read(),
        [0]);
    });

    it('2', () => {
      assert.deepStrictEqual(
        nat
          .filter(n => n % 2 === 0)
          .take(2)
          .read(),
        [0, 2]);
    });

    it('3', () => {
      assert.deepStrictEqual(
        nat
          .filter(n => n % 2 === 0)
          .take(3)
          .read(),
        [0, 2, 4]);
    });

  });

});
