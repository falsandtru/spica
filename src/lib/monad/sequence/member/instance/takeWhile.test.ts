import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/takeWhile', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));

  describe('takeWhile', () => {
    it('0 all', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons())
          .takeWhile(() => true)
          .read(),
        []);
    });

    it('0 nothing', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons())
          .takeWhile(() => false)
          .read(),
        []);
    });

    it('1 all', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .takeWhile(() => true)
          .read(),
        [0]);
    });

    it('1 nothing', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .takeWhile(() => false)
          .read(),
        []);
    });

    it('2 all', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .takeWhile(() => true)
          .read(),
        [0, 1]);
    });

    it('2 all', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .takeWhile(() => false)
          .read(),
        []);
    });

    it('0 take', () => {
      assert.deepStrictEqual(
        nat
          .takeWhile(n => n < 0)
          .read(),
        []);
    });

    it('1 take', () => {
      assert.deepStrictEqual(
        nat
          .takeWhile(n => n < 1)
          .read(),
        [0]);
    });

    it('2 take', () => {
      assert.deepStrictEqual(
        nat
          .takeWhile(n => n < 2)
          .read(),
        [0, 1]);
    });

    it('1 all', () => {
      assert.deepStrictEqual(
        nat
          .takeWhile(n => n < 3)
          .read(),
        [0, 1, 2]);
    });

  });

});
