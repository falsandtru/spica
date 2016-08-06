import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/zip', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));

  describe('Sequence.zip', () => {
    it('unlimited', () => {
      const even = nat.filter(n => n % 2 === 0);
      const odd = nat.filter(n => n % 2 === 1);
      assert.deepStrictEqual(
        Sequence.zip(odd, even).take(3).extract(),
        [[1, 0], [3, 2], [5, 4]]);
    });

    it('same', () => {
      const nat = new Sequence<number, number>((n = 0, cons) => n < 3 ? cons(n, n + 1) : cons(n));
      const even = nat.filter(n => n % 2 === 0);
      const odd = nat.filter(n => n % 2 === 1);
      assert.deepStrictEqual(
        Sequence.zip(odd, even).take(3).extract(),
        [[1, 0], [3, 2]]);
    });

    it('mismatch', () => {
      const neg = new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(-n, n + 1) : cons(-n));
      assert.deepStrictEqual(
        Sequence.zip(nat, neg).take(3).extract(),
        [[0, 0], [1, -1]]);
      assert.deepStrictEqual(
        Sequence.zip(neg, nat).take(3).extract(),
        [[0, 0], [-1, 1]]);
    });

    it('empty', () => {
      assert.deepStrictEqual(
        Sequence.zip(nat, Sequence.from([])).take(3).extract(),
        []);
      assert.deepStrictEqual(
        Sequence.zip(Sequence.from([]), nat).take(3).extract(),
        []);
      assert.deepStrictEqual(
        Sequence.zip(Sequence.from([]), Sequence.from([])).take(3).extract(),
        []);
    });

  });

});
