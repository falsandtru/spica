import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/memoize', () => {
  describe('memoize', () => {
    it('permanent', () => {
      let cnt = 0;
      const mem = Sequence.cycle([() => ++cnt])
        .map(f => f())
        .memoize();
      assert.deepStrictEqual(mem.take(1).bind(() => mem.take(2)).extract(), [1, 2]);
      assert.deepStrictEqual(mem.take(2).extract(), [1, 2]);
    });

  });

});
