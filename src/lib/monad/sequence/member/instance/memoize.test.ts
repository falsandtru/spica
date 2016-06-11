import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/memoize', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));
  const double = nat.map(n => n * 2);
  const triple = nat.map(n => n * 3);

  describe('memoize', () => {
    it('write unmemoized', () => {
      const seq = Sequence.write([0, 1, 2]);
      assert.deepStrictEqual(seq.read(), [0, 1, 2]);
      assert.deepStrictEqual(seq.read(), []);
    });

    it('write memoized', () => {
      const mem = Sequence.write([0, 1, 2]).memoize();
      assert.deepStrictEqual(mem.read(), [0, 1, 2]);
      assert.deepStrictEqual(mem.read(), [0, 1, 2]);
    });

  });

});
