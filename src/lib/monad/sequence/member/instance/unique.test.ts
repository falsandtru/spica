import { Sequence } from '../../../sequence';

describe('Unit: lib/monad/sequence/member/unique', () => {
  describe('unique', () => {
    it('', () => {
      assert.deepStrictEqual(
        Sequence.from([1, 2, 3, 3, 2, 4])
          .unique()
          .extract(),
        [1, 2, 3, 4]);
    });

  });

});
