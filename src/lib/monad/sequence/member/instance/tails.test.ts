import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/tails', () => {
  describe('tails', () => {
    it('0', () => {
      assert.deepStrictEqual(
        Sequence.from([])
          .tails()
          .extract(),
        [[]]);
    });

    it('1', () => {
      assert.deepStrictEqual(
        Sequence.from([1])
          .tails()
          .extract(),
        [[1], []]);
    });

    it('2', () => {
      assert.deepStrictEqual(
        Sequence.from([1, 2])
          .tails()
          .extract(),
        [[1, 2], [2], []]);
    });

  });

});
