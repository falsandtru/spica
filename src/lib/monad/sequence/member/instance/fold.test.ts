import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/fold', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));

  describe('fold', () => {
    it('0', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .fold((a, b) => Sequence.mappend(Sequence.from([a]), b), Sequence.from<number>([0]))
          .take(0)
          .read(),
        []);
    });

    it('1', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .fold((a, b) => Sequence.mappend(Sequence.from([a]), b), Sequence.from<number>([0]))
          .take(1)
          .read(),
        [1]);
    });

    it('2', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .fold((a, b) => Sequence.mappend(Sequence.from([a]), b), Sequence.from<number>([0]))
          .take(2)
          .read(),
        [1, 2]);
    });

    it('1..2', () => {
      assert.deepStrictEqual(
        Sequence.from([1, 2])
          .fold((a, b) => Sequence.mappend(Sequence.from([a, b.take(1).read()[0]]), b), Sequence.from<number>([0]))
          .read(),
        [1, 2, 2, 0, 0]);
    });

  });

});
