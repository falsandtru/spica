import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/inits', () => {
  describe('inits', () => {
    it('0', () => {
      assert.deepStrictEqual(
        Sequence.from([])
          .inits()
          .extract(),
        [[]]);
    });

    it('1', () => {
      assert.deepStrictEqual(
        Sequence.from([1])
          .inits()
          .extract(),
        [[], [1]]);
    });

    it('2', () => {
      assert.deepStrictEqual(
        Sequence.from([1, 2])
          .inits()
          .extract(),
        [[], [1], [1, 2]]);
    });

  });

});
