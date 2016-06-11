import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/dropWhile', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));
  const double = nat.map(n => n * 2);
  const triple = nat.map(n => n * 3);

  describe('dropWhile', () => {
    it('0 nothing', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons())
          .dropWhile(() => false)
          .read(),
        []);
    });

    it('0 all', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons())
          .dropWhile(() => true)
          .read(),
        []);
    });

    it('1 nothing', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .dropWhile(() => false)
          .read(),
        [0]);
    });

    it('1 all', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .dropWhile(() => true)
          .read(),
        []);
    });

    it('2 nothing', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .dropWhile(() => false)
          .read(),
        [0, 1]);
    });

    it('2 all', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .dropWhile(() => true)
          .read(),
        []);
    });

    it('0 take', () => {
      assert.deepStrictEqual(
        nat
          .dropWhile(n => n < 0)
          .take(3)
          .read(),
        [0, 1, 2]);
    });

    it('1 take', () => {
      assert.deepStrictEqual(
        nat
          .dropWhile(n => n < 1)
          .take(3)
          .read(),
        [1, 2, 3]);
    });

    it('2 take', () => {
      assert.deepStrictEqual(
        nat
          .dropWhile(n => n < 2)
          .take(3)
          .read(),
        [2, 3, 4]);
    });

  });

});
