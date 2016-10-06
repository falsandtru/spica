import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/sort', () => {
  describe('sort', () => {
    it('empty', () => {
      assert.deepStrictEqual(
        Sequence.from([])
          .sort()
          .extract(),
        []);
    });

    it('sorted', () => {
      assert.deepStrictEqual(
        Sequence.from([0, 1, 2])
          .sort()
          .extract(),
        [0, 1, 2]);
    });

    it('unsorted', () => {
      assert.deepStrictEqual(
        Sequence.from([2, 0, 1])
          .sort()
          .extract(),
        [0 ,1, 2]);
    });

  });

});
