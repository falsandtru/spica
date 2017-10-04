import { Sequence } from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/sequence', () => {
  describe('Sequence.sequence', () => {
    it('', () => {
      assert.deepStrictEqual(
        Sequence.sequence([Sequence.from([0, 1]), Sequence.from([2, 3])])
          .map(m => m.extract())
          .extract(),
        [[0, 1, 2, 3]]);
    });

  });

});
