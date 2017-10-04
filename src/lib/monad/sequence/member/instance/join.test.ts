import { Sequence } from '../../../sequence';

describe('Unit: lib/monad/sequence/member/join', () => {
  describe('join', () => {
    it('', () => {
      assert.deepStrictEqual(
        Sequence.from([Sequence.from([0, 1]), Sequence.from([2, 3])])
          .join()
          .extract(),
        [0, 1, 2, 3]);
    });

  });

});
