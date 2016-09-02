import {Sequence} from '../../../sequence';
import {sqid} from '../../../../sqid';

describe('Unit: lib/monad/sequence/member/static/from', () => {
  describe('Sequence.from', () => {
    it('side effect', () => {
      const s = Sequence.from(Sequence.random(sqid)).take(5);
      assert(s.extract().length === 5);
      assert.notDeepStrictEqual(
        s.extract(),
        s.extract());
    });

    it('idempotence', () => {
      assert.deepStrictEqual(
        Sequence.from([0, 1])
          .fold((a, b) => Sequence.from([a].concat(b.extract()).concat(b.extract())), Sequence.from<number>([]))
          .extract(),
        [0, 1, 1]);
    });

    it('array', () => {
      assert.deepStrictEqual(
        Sequence.from([])
          .extract(),
        []);
      assert.deepStrictEqual(
        Sequence.from([0])
          .extract(),
        [0]);
      assert.deepStrictEqual(
        Sequence.from([0, 1])
          .extract(),
        [0, 1]);
      assert.deepStrictEqual(
        Sequence.from([0, 1, 2])
          .extract(),
        [0, 1, 2]);
    });

  });

});
