import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/from', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));
  const double = nat.map(n => n * 2);
  const triple = nat.map(n => n * 3);

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
