import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/repeat', () => {
  describe('Sequence.repeat', () => {
    it('array', () => {
      assert.deepStrictEqual(
        Sequence.repeat([])
          .read(),
        []);
      assert.deepStrictEqual(
        Sequence.repeat([0])
          .take(3)
          .read(),
        [0, 0, 0]);
      assert.deepStrictEqual(
        Sequence.repeat([0, 1])
          .take(3)
          .read(),
        [0, 1, 0]);
      assert.deepStrictEqual(
        Sequence.repeat([0, 1, 2])
          .take(3)
          .read(),
        [0, 1, 2]);
    });

  });

});
