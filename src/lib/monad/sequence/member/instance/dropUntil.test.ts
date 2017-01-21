import { Sequence } from '../../../sequence';
import { nat } from '../../../sequence.test';

describe('Unit: lib/monad/sequence/member/dropUntil', () => {
  describe('dropUntil', () => {
    it('0 always', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((_ = 0, cons) => cons())
          .dropUntil(() => true)
          .extract(),
        []);
    });

    it('0 never', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((_ = 0, cons) => cons())
          .dropUntil(() => false)
          .extract(),
        []);
    });

    it('1 always', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .dropUntil(() => true)
          .extract(),
        []);
    });

    it('1 never', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .dropUntil(() => false)
          .extract(),
        [0]);
    });

    it('2 always', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .dropUntil(() => true)
          .extract(),
        []);
    });

    it('2 never', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .dropUntil(() => false)
          .extract(),
        [0, 1]);
    });

    it('1', () => {
      assert.deepStrictEqual(
        nat
          .dropUntil(n => n < 0)
          .take(3)
          .extract(),
        [0, 1, 2]);
    });

    it('2', () => {
      assert.deepStrictEqual(
        nat
          .dropUntil(n => n < 1)
          .take(3)
          .extract(),
        [1, 2, 3]);
    });

    it('3', () => {
      assert.deepStrictEqual(
        nat
          .dropUntil(n => n < 2)
          .take(3)
          .extract(),
        [2, 3, 4]);
    });

  });

});
