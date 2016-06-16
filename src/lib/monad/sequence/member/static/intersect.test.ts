import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/intersect/', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));
  const double = nat.map(n => n * 2);
  const triple = nat.map(n => n * 3);

  describe('Sequence.intersect', () => {
    it('unlimited', () => {
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => a - b, [double, triple]).take(3).read(),
        [0, 6, 12]);
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => b - a, [double.map(n => -n), triple.map(n => -n)]).take(3).read(),
        [0, 6, 12].map(n => -n));
    });

    it('same', () => {
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => a - b, [double, triple]).take(3).read(),
        [0, 6, 12]);
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => b - a, [double.map(n => -n), triple.map(n => -n)]).take(3).read(),
        [0, 6, 12].map(n => -n));
    });

    it('mismatch', () => {
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => a - b, [double.dropWhile(n => n < 6).takeUntil(n => n === 12), triple]).take(2).read(),
        [6, 12]);
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => a - b, [triple, double.dropWhile(n => n < 6).takeUntil(n => n === 12)]).take(2).read(),
        [6, 12]);
    });

    it('empty', () => {
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => a - b, [nat, Sequence.from([])]).take(3).read(),
        []);
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => a - b, [Sequence.from([]), nat]).take(3).read(),
        []);
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => a - b, [Sequence.from([]), Sequence.from([])]).take(3).read(),
        []);
    });

    it('multiple', () => {
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => a - b, [
          new Sequence<number, number>((n = 0, cons) => cons(n, n + 2)),
          new Sequence<number, number>((n = 0, cons) => cons(n, n + 3)),
          new Sequence<number, number>((n = 0, cons) => cons(n, n + 5))
        ])
          .take(3).read(),
        [0, 30, 60]);
    });

  });

});
