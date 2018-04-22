import { Sequence } from '../../../sequence';
import { nat } from '../../../sequence.test';

describe('Unit: lib/monad/sequence/member/static/resume', () => {
  describe('Sequence.resume', () => {
    it('nat', () => {
      assert.deepStrictEqual(
        Sequence.resume(Sequence.Thunk.iterator(nat.iterate()))
          .take(3)
          .extract(),
        [1, 2, 3]);
    });

  });

});
