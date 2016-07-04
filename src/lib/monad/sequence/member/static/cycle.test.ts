import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/cycle', () => {
  describe('Sequence.cycle', () => {
    it('array', () => {
      assert.deepStrictEqual(
        Sequence.cycle([])
          .read(),
        []);
      assert.deepStrictEqual(
        Sequence.cycle([0])
          .take(3)
          .read(),
        [0, 0, 0]);
      assert.deepStrictEqual(
        Sequence.cycle([0, 1])
          .take(3)
          .read(),
        [0, 1, 0]);
      assert.deepStrictEqual(
        Sequence.cycle([0, 1, 2])
          .take(3)
          .read(),
        [0, 1, 2]);
    });

  });

});
