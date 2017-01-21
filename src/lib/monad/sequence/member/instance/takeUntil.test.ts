import {Sequence} from '../../../sequence';
import {nat} from '../../../sequence.test';

describe('Unit: lib/monad/sequence/member/takeUntil', () => {
  describe('takeUntil', () => {
    it('0 always', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((_ = 0, cons) => cons())
          .takeUntil(() => true)
          .extract(),
        []);
    });

    it('0 never', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((_ = 0, cons) => cons())
          .takeUntil(() => false)
          .extract(),
        []);
    });

    it('1 always', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .takeUntil(() => true)
          .extract(),
        [0]);
    });

    it('1 never', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .takeUntil(() => false)
          .extract(),
        [0]);
    });

    it('2 always', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .takeUntil(() => true)
          .extract(),
        [0]);
    });

    it('2 never', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .takeUntil(() => false)
          .extract(),
        [0, 1]);
    });

    it('1', () => {
      assert.deepStrictEqual(
        nat
          .takeUntil(n => n === 0)
          .extract(),
        [0]);
    });

    it('2', () => {
      assert.deepStrictEqual(
        nat
          .takeUntil(n => n === 1)
          .extract(),
        [0, 1]);
    });

    it('3', () => {
      assert.deepStrictEqual(
        nat
          .takeUntil(n => n === 2)
          .extract(),
        [0, 1, 2]);
    });

  });

});
