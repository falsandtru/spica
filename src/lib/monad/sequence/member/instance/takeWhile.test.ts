import {Sequence, nat} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/takeWhile', () => {
  describe('takeWhile', () => {
    it('0 all', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((_ = 0, cons) => cons())
          .takeWhile(() => true)
          .extract(),
        []);
    });

    it('0 nothing', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((_ = 0, cons) => cons())
          .takeWhile(() => false)
          .extract(),
        []);
    });

    it('1 all', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .takeWhile(() => true)
          .extract(),
        [0]);
    });

    it('1 nothing', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .takeWhile(() => false)
          .extract(),
        []);
    });

    it('2 all', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .takeWhile(() => true)
          .extract(),
        [0, 1]);
    });

    it('2 all', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .takeWhile(() => false)
          .extract(),
        []);
    });

    it('0 take', () => {
      assert.deepStrictEqual(
        nat
          .takeWhile(n => n < 0)
          .extract(),
        []);
    });

    it('1', () => {
      assert.deepStrictEqual(
        nat
          .takeWhile(n => n < 1)
          .extract(),
        [0]);
    });

    it('2', () => {
      assert.deepStrictEqual(
        nat
          .takeWhile(n => n < 2)
          .extract(),
        [0, 1]);
    });

    it('3', () => {
      assert.deepStrictEqual(
        nat
          .takeWhile(n => n < 3)
          .extract(),
        [0, 1, 2]);
    });

  });

});
