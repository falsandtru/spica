import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/from', () => {
  describe('Sequence.from', () => {
    it('array', () => {
      assert.deepStrictEqual(
        Sequence.from([])
          .read(),
        []);
      assert.deepStrictEqual(
        Sequence.from([0])
          .read(),
        [0]);
      assert.deepStrictEqual(
        Sequence.from([0, 1])
          .read(),
        [0, 1]);
      assert.deepStrictEqual(
        Sequence.from([0, 1, 2])
          .read(),
        [0, 1, 2]);
    });

  });

});
