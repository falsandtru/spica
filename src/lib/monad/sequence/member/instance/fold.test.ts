import {Sequence} from '../../../sequence';
import {nat} from '../../../sequence.test';

describe('Unit: lib/monad/sequence/member/fold', () => {
  describe('fold', () => {
    it('0', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .fold((a, b) => Sequence.mappend(Sequence.from([a]), b), Sequence.from<number>([0]))
          .take(0)
          .extract(),
        []);
    });

    it('1', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .fold((a, b) => Sequence.mappend(Sequence.from([a]), b), Sequence.from<number>([0]))
          .take(1)
          .extract(),
        [1]);
    });

    it('2', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .fold((a, b) => Sequence.mappend(Sequence.from([a]), b), Sequence.from<number>([0]))
          .take(2)
          .extract(),
        [1, 2]);
    });

    it('1..2', () => {
      assert.deepStrictEqual(
        Sequence.from([1, 2])
          .fold((a, b) => Sequence.mappend(Sequence.from([a, b.take(1).extract()[0]]), b), Sequence.from<number>([0]))
          .extract(),
        [1, 2, 2, 0, 0]);
    });

  });

});
