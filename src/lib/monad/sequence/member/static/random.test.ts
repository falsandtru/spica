import {Sequence} from '../../../sequence';
import {sqid} from '../../../../sqid';

describe('Unit: lib/monad/sequence/member/static/random', () => {
  describe('Sequence.random', () => {
    it('validate', () => {
      assert.deepStrictEqual(
        Sequence.random(sqid)
          .take(5)
          .subsequences()
          .filter(ns => ns.length === 2)
          .extract()
          .reduce((cnt, [n, m]) => n !== m ? ++cnt : cnt, 0),
          10);

      assert.notDeepStrictEqual(
        Sequence.random()
          .take(9)
          .extract(),
        Sequence.random()
          .take(9)
          .extract());
    });

    it('number', () => {
      assert.deepStrictEqual(
        Sequence.random()
          .take(9)
          .map(n => n >= 0 && n < 1)
          .extract(),
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
          .extract(),
        [true, true, true, true, true, true, true, true, true]);
    });

  });

});
