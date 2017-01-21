import {Sequence} from '../../../sequence';
import {nat} from '../../../sequence.test';

describe('Unit: lib/monad/sequence/member/mapM', () => {
  describe('mapM', () => {
    it('0 []', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(0)
          .mapM(_ => Sequence.from([]))
          .extract(),
        []);
    });

    it('0 [n]', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(0)
          .mapM(n => Sequence.from([n]))
          .extract(),
        []);
    });

    it('0 [n, -n]', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(0)
          .mapM(n => Sequence.from([n, -n]))
          .extract(),
        []);
    });

    it('1 []', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(1)
          .mapM(_ => Sequence.from([]))
          .extract(),
        []);
    });

    it('1 [n]', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(1)
          .mapM(n => Sequence.from([n]))
          .extract(),
        [[1]]);
    });

    it('1 [n, -n]', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(1)
          .mapM(n => Sequence.from([n, -n]))
          .extract(),
        [[1], [-1]]);
    });

    it('1..2 [n, -n] 1', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(2)
          .mapM(n => Sequence.from([n, -n]))
          .take(1)
          .extract(),
        [[1, 2]]);
    });

    it('1..2 [n, -n]', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(2)
          .mapM(n => Sequence.from([n, -n]))
          .extract(),
        [[1, 2], [1, -2], [-1, 2], [-1, -2]]);
    });

    it('1..3 [n, -n]', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(3)
          .mapM(n => Sequence.from([n, -n]))
          .extract(),
        [
          [1, 2, 3], [1, 2, -3], [1, -2, 3], [1, -2, -3],
          [-1, 2, 3], [-1, 2, -3], [-1, -2, 3], [-1, -2, -3]
        ]);
    });

  });

});
