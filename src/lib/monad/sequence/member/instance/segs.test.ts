import { Sequence } from '../../../sequence';

describe('Unit: lib/monad/sequence/member/segs', () => {
  describe('segs', () => {
    it('0', () => {
      assert.deepStrictEqual(
        Sequence.from([])
          .segs()
          .extract(),
        [[]]);
    });

    it('1', () => {
      assert.deepStrictEqual(
        Sequence.from([1])
          .segs()
          .extract(),
        [[1], []]);
    });

    it('2', () => {
      assert.deepStrictEqual(
        Sequence.from([1, 2])
          .segs()
          .extract(),
        [[1], [1, 2], [2], []]);
    });

    it('3', () => {
      assert.deepStrictEqual(
        Sequence.from([1, 2, 3])
          .segs()
          .extract(),
        [[1], [1, 2], [1, 2, 3], [2], [2, 3], [3], []]);
    });

  });

});
