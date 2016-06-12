import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/from', () => {
  describe('Sequence.from', () => {
    it('array', () => {
      assert.deepStrictEqual(
        Sequence.from([])
          .takeWhile(() => true)
          .read(),
        []);
      assert.deepStrictEqual(
        Sequence.from([0])
          .takeWhile(() => true)
          .read(),
        [0]);
      assert.deepStrictEqual(
        Sequence.from([0, 1])
          .takeWhile(() => true)
          .read(),
        [0, 1]);
      assert.deepStrictEqual(
        Sequence.from([0, 1, 2])
          .takeWhile(() => true)
          .read(),
        [0, 1, 2]);
    });

  });

});
