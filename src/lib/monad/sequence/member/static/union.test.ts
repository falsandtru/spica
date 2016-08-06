import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/union', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));
  const double = nat.map(n => n * 2);
  const triple = nat.map(n => n * 3);

  describe('Sequence.union', () => {
    it('unlimited', () => {
      assert.deepStrictEqual(
        Sequence.union(double, triple, (a, b) => a - b).take(7).extract(),
        [0, 2, 3, 4, 6, 8, 9]);
      assert.deepStrictEqual(
        Sequence.union(double.map(n => -n), triple.map(n => -n), (a, b) => b - a).take(7).extract(),
        [0, 2, 3, 4, 6, 8, 9].map(n => -n));
    });

    it('same', () => {
      assert.deepStrictEqual(
        Sequence.union(double, triple, (a, b) => a - b).take(7).extract(),
        [0, 2, 3, 4, 6, 8, 9]);
      assert.deepStrictEqual(
        Sequence.union(double.map(n => -n), triple.map(n => -n), (a, b) => b - a).take(7).extract(),
        [0, 2, 3, 4, 6, 8, 9].map(n => -n));
    });

    it('mismatch', () => {
      assert.deepStrictEqual(
        Sequence.union(double.dropWhile(n => n < 6).takeUntil(n => n === 12), triple, (a, b) => a - b).take(8).extract(),
        [0, 3, 6, 8, 9, 10, 12, 15]);
      assert.deepStrictEqual(
        Sequence.union(triple, double.dropWhile(n => n < 6).takeUntil(n => n === 12), (a, b) => a - b).take(8).extract(),
        [0, 3, 6, 8, 9, 10, 12, 15]);
    });

    it('empty', () => {
      assert.deepStrictEqual(
        Sequence.union(nat, Sequence.from([]), (a, b) => a - b).take(3).extract(),
        [0, 1, 2]);
      assert.deepStrictEqual(
        Sequence.union(Sequence.from([]), nat, (a, b) => a - b).take(3).extract(),
        [0, 1, 2]);
      assert.deepStrictEqual(
        Sequence.union(Sequence.from([]), Sequence.from([]), (a, b) => a - b).take(3).extract(),
        []);
    });

  });

});
