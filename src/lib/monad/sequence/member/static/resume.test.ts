import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/resume', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));

  describe('Sequence.resume', () => {
    it('nat', () => {
      assert.deepStrictEqual(
        Sequence.resume(Sequence.Thunk.iterator(nat.iterate()))
          .take(3)
          .extract(),
        [1, 2, 3]);
    });

  });

});
