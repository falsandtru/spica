import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/takeUntil', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));

  describe('takeUntil', () => {
    it('0 always', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons())
          .takeUntil(() => true)
          .read(),
        []);
    });

    it('0 never', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons())
          .takeUntil(() => false)
          .read(),
        []);
    });

    it('1 always', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .takeUntil(() => true)
          .read(),
        [0]);
    });

    it('1 never', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .takeUntil(() => false)
          .read(),
        [0]);
    });

    it('2 always', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .takeUntil(() => true)
          .read(),
        [0]);
    });

    it('2 never', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .takeUntil(() => false)
          .read(),
        [0, 1]);
    });

    it('0', () => {
      assert.deepStrictEqual(
        nat
          .takeUntil(n => n === 0)
          .read(),
        [0]);
    });

    it('1', () => {
      assert.deepStrictEqual(
        nat
          .takeUntil(n => n === 1)
          .read(),
        [0, 1]);
    });

    it('2', () => {
      assert.deepStrictEqual(
        nat
          .takeUntil(n => n === 2)
          .read(),
        [0, 1, 2]);
    });

  });

});
