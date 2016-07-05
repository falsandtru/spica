import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/filterM', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));

  describe('filterM', () => {
    it('0 [false]', () => {
      assert.deepStrictEqual(
        nat
          .take(0)
          .filterM(() => Sequence.from([false]))
          .read(),
        [[]]);
    });

    it('0 [true]', () => {
      assert.deepStrictEqual(
        nat
          .take(0)
          .filterM(() => Sequence.from([true]))
          .read(),
        [[]]);
    });

    it('0 [true, false]', () => {
      assert.deepStrictEqual(
        nat
          .take(0)
          .filterM(() => Sequence.from([true, false]))
          .read(),
        [[]]);
    });

    it('1 [false]', () => {
      assert.deepStrictEqual(
        nat
          .take(1)
          .filterM(() => Sequence.from([false]))
          .read(),
        [[]]);
    });

    it('1 [true]', () => {
      assert.deepStrictEqual(
        nat
          .take(1)
          .filterM(() => Sequence.from([true]))
          .read(),
        [[0]]);
    });

    it('1 [true, false]', () => {
      assert.deepStrictEqual(
        nat
          .take(1)
          .filterM(() => Sequence.from([true, false]))
          .read(),
        [[0], []]);
    });

    it('2 [true] 1', () => {
      assert.deepStrictEqual(
        nat
          .take(2)
          .filterM(() => Sequence.from([true, false]))
          .take(1)
          .read(),
        [[0, 1]]);
    });

    it('2 [true]', () => {
      assert.deepStrictEqual(
        nat
          .take(2)
          .filterM(() => Sequence.from([true, false]))
          .read(),
        [[0, 1], [0], [1], []]);
    });

    it('2 [true]', () => {
      assert.deepStrictEqual(
        nat
          .take(3)
          .filterM(() => Sequence.from([true, false]))
          .read(),
        [[0, 1, 2], [0, 1], [0, 2], [0], [1, 2], [1], [2], []]);
    });

  });

});
