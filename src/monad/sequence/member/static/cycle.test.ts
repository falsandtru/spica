import { Sequence } from '../../../sequence';
import { counter } from '../../../../counter';

describe('Unit: lib/monad/sequence/member/static/cycle', () => {
  describe('Sequence.cycle', () => {
    it('side effect', () => {
      const s = Sequence.cycle(Sequence.random(counter()).take(2)).take(5);
      assert(s.extract().length === 5);
      assert.notDeepStrictEqual(
        s.extract(),
        s.extract());
    });

    it('idempotence', () => {
      assert.deepStrictEqual(
        Sequence.cycle([1])
          .take(2)
          .foldr((a, b) => Sequence.from([a].concat(b.extract()).concat(b.extract())), Sequence.from<number>([0]))
          .extract(),
        [1, 1, 0, 0, 1, 0, 0]);
    });

    it('array', () => {
      assert.deepStrictEqual(
        Sequence.cycle([0])
          .take(3)
          .extract(),
        [0, 0, 0]);
      assert.deepStrictEqual(
        Sequence.cycle([0, 1])
          .take(3)
          .extract(),
        [0, 1, 0]);
      assert.deepStrictEqual(
        Sequence.cycle([0, 1, 2])
          .take(3)
          .extract(),
        [0, 1, 2]);
    });

  });

});
