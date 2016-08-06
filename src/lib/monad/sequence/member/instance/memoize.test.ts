import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/memoize', () => {
  describe('memoize', () => {
    it('read unmemoized', () => {
      const seq = Sequence.read([0, 1, 2]);
      assert.deepStrictEqual(seq.extract(), [0, 1, 2]);
      assert.deepStrictEqual(seq.extract(), []);
    });

    it('read memoized', () => {
      const mem = Sequence.read([0, 1, 2]).memoize();
      assert.deepStrictEqual(mem.extract(), [0, 1, 2]);
      assert.deepStrictEqual(mem.extract(), [0, 1, 2]);
    });

  });

});
