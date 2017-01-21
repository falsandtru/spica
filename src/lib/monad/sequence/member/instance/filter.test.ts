import {nat} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/filter', () => {
  describe('filter', () => {
    it('0', () => {
      assert.deepStrictEqual(
        nat
          .filter(n => n % 2 === 0)
          .take(0)
          .extract(),
        []);
    });

    it('1', () => {
      assert.deepStrictEqual(
        nat
          .filter(n => n % 2 === 0)
          .take(1)
          .extract(),
        [0]);
    });

    it('2', () => {
      assert.deepStrictEqual(
        nat
          .filter(n => n % 2 === 0)
          .take(2)
          .extract(),
        [0, 2]);
    });

    it('3', () => {
      assert.deepStrictEqual(
        nat
          .filter(n => n % 2 === 0)
          .take(3)
          .extract(),
        [0, 2, 4]);
    });

  });

});
