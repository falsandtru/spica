import { Sequence } from '../../../sequence';

describe('Unit: lib/monad/sequence/member/reduce', () => {
  describe('reduce', () => {
    it('temporary', () => {
      let cnt = 0;
      const mem = Sequence.cycle([() => ++cnt])
        .map(f => f())
        .reduce();
      assert.deepStrictEqual(
        mem
          .take(2)
          .foldr((a, b) => Sequence.from([a].concat(b.extract()).concat(b.extract())), Sequence.from<number>([]))
          .extract(),
        [1, 2, 2]);
      assert.deepStrictEqual(
        mem
          .take(2)
          .foldr((a, b) => Sequence.from([a].concat(b.extract()).concat(b.extract())), Sequence.from<number>([]))
          .extract(),
        [3, 4, 4]);
    });

  });

});
