import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/random', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));
  const double = nat.map(n => n * 2);
  const triple = nat.map(n => n * 3);

  describe('Sequence.random', () => {
    it('number', () => {
      assert.deepStrictEqual(
        Sequence.random()
          .take(9)
          .map(n => n >= 0 && n < 1)
          .read(),
        [true, true, true, true, true, true, true, true, true]);
    });

    it('array', () => {
      assert.deepStrictEqual(
        Sequence.random([0, 1, 2])
          .take(9)
          .map(n => {
            switch (n) {
              case 0:
              case 1:
              case 2:
                return true;
              default:
                return false;
            }
          })
          .read(),
        [true, true, true, true, true, true, true, true, true]);
    });

  });

});
