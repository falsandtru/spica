import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/union', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));
  const double = nat.map(n => n * 2);
  const triple = nat.map(n => n * 3);

  describe('Sequence.union', () => {
    it('unlimited', () => {
      assert.deepStrictEqual(
        Sequence.union((a, b) => a - b, [double, triple]).take(7).read(),
        [0, 2, 3, 4, 6, 8, 9]);
      assert.deepStrictEqual(
        Sequence.union((a, b) => b - a, [double.map(n => -n), triple.map(n => -n)]).take(7).read(),
        [0, 2, 3, 4, 6, 8, 9].map(n => -n));
    });

    it('same', () => {
      assert.deepStrictEqual(
        Sequence.union((a, b) => a - b, [double, triple]).take(7).read(),
        [0, 2, 3, 4, 6, 8, 9]);
      assert.deepStrictEqual(
        Sequence.union((a, b) => b - a, [double.map(n => -n), triple.map(n => -n)]).take(7).read(),
        [0, 2, 3, 4, 6, 8, 9].map(n => -n));
    });

    it('mismatch', () => {
      assert.deepStrictEqual(
        Sequence.union((a, b) => a - b, [double.dropWhile(n => n < 6).takeUntil(n => n === 12), triple]).take(8).read(),
        [0, 3, 6, 8, 9, 10, 12, 15]);
      assert.deepStrictEqual(
        Sequence.union((a, b) => a - b, [triple, double.dropWhile(n => n < 6).takeUntil(n => n === 12)]).take(8).read(),
        [0, 3, 6, 8, 9, 10, 12, 15]);
    });

    it('empty', () => {
      assert.deepStrictEqual(
        Sequence.union((a, b) => a - b, [nat, Sequence.from([])]).take(3).read(),
        [0, 1, 2]);
      assert.deepStrictEqual(
        Sequence.union((a, b) => a - b, [Sequence.from([]), nat]).take(3).read(),
        [0, 1, 2]);
      assert.deepStrictEqual(
        Sequence.union((a, b) => a - b, [Sequence.from([]), Sequence.from([])]).take(3).read(),
        []);
    });

    it('multiple', () => {
      assert.deepStrictEqual(
        Sequence.union((a, b) => a - b, [
          new Sequence<number, number>((n = 0, cons) => cons(n, n + 2)),
          new Sequence<number, number>((n = 0, cons) => cons(n, n + 3)),
          new Sequence<number, number>((n = 0, cons) => cons(n, n + 5))
        ])
          .take(9).read(),
        [0, 2, 3, 4, 5, 6, 8, 9, 10]);
    });

  });

});
