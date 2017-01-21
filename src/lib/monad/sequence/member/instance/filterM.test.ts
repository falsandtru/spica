import {Sequence} from '../../../sequence';
import {nat} from '../../../sequence.test';

describe('Unit: lib/monad/sequence/member/filterM', () => {
  describe('filterM', () => {
    it('0 []', () => {
      assert.deepStrictEqual(
        nat
          .take(0)
          .filterM(() => Sequence.from([]))
          .extract(),
        [[]]);
    });

    it('0 [false]', () => {
      assert.deepStrictEqual(
        nat
          .take(0)
          .filterM(() => Sequence.from([false]))
          .extract(),
        [[]]);
    });

    it('0 [true]', () => {
      assert.deepStrictEqual(
        nat
          .take(0)
          .filterM(() => Sequence.from([true]))
          .extract(),
        [[]]);
    });

    it('0 [true, false]', () => {
      assert.deepStrictEqual(
        nat
          .take(0)
          .filterM(() => Sequence.from([true, false]))
          .extract(),
        [[]]);
    });

    it('1 []', () => {
      assert.deepStrictEqual(
        nat
          .take(1)
          .filterM(() => Sequence.from([]))
          .extract(),
        []);
    });

    it('1 [false]', () => {
      assert.deepStrictEqual(
        nat
          .take(1)
          .filterM(() => Sequence.from([false]))
          .extract(),
        [[]]);
    });

    it('1 [true]', () => {
      assert.deepStrictEqual(
        nat
          .take(1)
          .filterM(() => Sequence.from([true]))
          .extract(),
        [[0]]);
    });

    it('1 [true, false]', () => {
      assert.deepStrictEqual(
        nat
          .take(1)
          .filterM(() => Sequence.from([true, false]))
          .extract(),
        [[0], []]);
    });

    it('1 [false, true]', () => {
      assert.deepStrictEqual(
        nat
          .take(1)
          .filterM(() => Sequence.from([false, true]))
          .extract(),
        [[], [0]]);
    });

    it('2 []', () => {
      assert.deepStrictEqual(
        nat
          .take(2)
          .filterM(() => Sequence.from([]))
          .take(1)
          .extract(),
        []);
    });

    it('2 [true]', () => {
      assert.deepStrictEqual(
        nat
          .take(2)
          .filterM(() => Sequence.from([true]))
          .extract(),
        [[0, 1]]);
    });

    it('2 [false]', () => {
      assert.deepStrictEqual(
        nat
          .take(2)
          .filterM(() => Sequence.from([false]))
          .extract(),
        [[]]);
    });

    it('2 [true, false]', () => {
      assert.deepStrictEqual(
        nat
          .take(2)
          .filterM(() => Sequence.from([true, false]))
          .extract(),
        [[0, 1], [0], [1], []]);
    });

    it('2 [false, true]', () => {
      assert.deepStrictEqual(
        nat
          .take(2)
          .filterM(() => Sequence.from([false, true]))
          .extract(),
        [[], [1], [0], [0, 1]]);
    });

    it('3 [true]', () => {
      assert.deepStrictEqual(
        nat
          .take(3)
          .filterM(() => Sequence.from([true]))
          .extract(),
        [[0, 1, 2]]);
    });

    it('3 [false]', () => {
      assert.deepStrictEqual(
        nat
          .take(3)
          .filterM(() => Sequence.from([false]))
          .extract(),
        [[]]);
    });

    it('3 [true, false]', () => {
      assert.deepStrictEqual(
        nat
          .take(3)
          .filterM(() => Sequence.from([true, false]))
          .extract(),
        [[0, 1, 2], [0, 1], [0, 2], [0], [1, 2], [1], [2], []]);
    });

    it('3 [false, true]', () => {
      assert.deepStrictEqual(
        nat
          .take(3)
          .filterM(() => Sequence.from([false, true]))
          .extract(),
        [[], [2], [1], [1, 2], [0], [0, 2], [0, 1], [0, 1, 2]]);
    });

  });

});
