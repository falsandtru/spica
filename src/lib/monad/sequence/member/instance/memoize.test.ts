import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/memoize', () => {
  describe('memoize', () => {
    it('write unmemoized', () => {
      const seq = Sequence.write([0, 1, 2]);
      assert.deepStrictEqual(seq.extract(), [0, 1, 2]);
      assert.deepStrictEqual(seq.extract(), []);
    });

    it('write memoized', () => {
      const mem = Sequence.write([0, 1, 2]).memoize();
      assert.deepStrictEqual(mem.extract(), [0, 1, 2]);
      assert.deepStrictEqual(mem.extract(), [0, 1, 2]);
    });

  });

});
