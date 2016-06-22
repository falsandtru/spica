import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/concat', () => {
  describe('Sequence.concat', () => {
    it('Sequence<Sequence<T, S>, S>', () => {
      assert.deepStrictEqual(
        Sequence.concat(Sequence.from([Sequence.from([0, 1, 2])]))
          .take(2)
          .read(),
        [0, 1]);
    });

  });

});
