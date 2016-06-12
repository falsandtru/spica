import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/random', () => {
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
