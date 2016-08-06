import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/from', () => {
  describe('Sequence.from', () => {
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
