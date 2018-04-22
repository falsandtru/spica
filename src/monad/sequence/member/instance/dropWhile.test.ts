import { Sequence } from '../../../sequence';
import { nat } from '../../../sequence.test';

describe('Unit: lib/monad/sequence/member/dropWhile', () => {
  describe('dropWhile', () => {
    it('0 nothing', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((_ = 0, cons) => cons())
          .dropWhile(() => false)
          .extract(),
        []);
    });

    it('0 all', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((_ = 0, cons) => cons())
          .dropWhile(() => true)
          .extract(),
        []);
    });

    it('1 nothing', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .dropWhile(() => false)
          .extract(),
        [0]);
    });

    it('1 all', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .dropWhile(() => true)
          .extract(),
        []);
    });

    it('2 nothing', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .dropWhile(() => false)
          .extract(),
        [0, 1]);
    });

    it('2 all', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .dropWhile(() => true)
          .extract(),
        []);
    });

    it('0', () => {
      assert.deepStrictEqual(
        nat
          .dropWhile(n => n < 0)
          .take(3)
          .extract(),
        [0, 1, 2]);
    });

    it('1', () => {
      assert.deepStrictEqual(
        nat
          .dropWhile(n => n < 1)
          .take(3)
          .extract(),
        [1, 2, 3]);
    });

    it('2', () => {
      assert.deepStrictEqual(
        nat
          .dropWhile(n => n < 2)
          .take(3)
          .extract(),
        [2, 3, 4]);
    });

  });

});
