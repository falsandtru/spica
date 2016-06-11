import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/mapM', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));
  const double = nat.map(n => n * 2);
  const triple = nat.map(n => n * 3);

  describe('mapM', () => {
    it('0 []', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(0)
          .mapM(n => Sequence.from([]))
          .read(),
        []);
    });

    it('0 [n]', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(0)
          .mapM(n => Sequence.from([n]))
          .read(),
        []);
    });

    it('0 [n, -n]', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(0)
          .mapM(n => Sequence.from([n, -n]))
          .read(),
        []);
    });

    it('1 [] 0', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(1)
          .mapM(n => Sequence.from([]))
          .take(0)
          .read(),
        []);
    });

    it('1 [n] 0', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(1)
          .mapM(n => Sequence.from([n]))
          .take(0)
          .read(),
        []);
    });

    it('1 [n, -n] 0', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(1)
          .mapM(n => Sequence.from([n, -n]))
          .take(0)
          .read(),
        []);
    });

    it('1 []', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(1)
          .mapM(n => Sequence.from([]))
          .read(),
        []);
    });

    it('1 [n]', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(1)
          .mapM(n => Sequence.from([n]))
          .read(),
        [[1]]);
    });

    it('1 [n, -n]', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(1)
          .mapM(n => Sequence.from([n, -n]))
          .read(),
        [[1], [-1]]);
    });

    it('1..2 [n, -n] 1', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(2)
          .mapM(n => Sequence.from([n, -n]))
          .take(1)
          .read(),
        [[1, 2]]);
    });

    it('1..2 [n, -n]', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(2)
          .mapM(n => Sequence.from([n, -n]))
          .read(),
        [[1, 2], [1, -2], [-1, 2], [-1, -2]]);
    });

    it('1..3 [n, -n]', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(3)
          .mapM(n => Sequence.from([n, -n]))
          .read(),
        [
          [1, 2, 3], [1, 2, -3], [1, -2, 3], [1, -2, -3],
          [-1, 2, 3], [-1, 2, -3], [-1, -2, 3], [-1, -2, -3]
        ]);
    });

  });

});
