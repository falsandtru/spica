import {concat} from './concat';

describe('Unit: lib/concat', () => {
  describe('concat', () => {
    it('shallow', () => {
      assert.deepStrictEqual(
        concat([], [1, 2, 3]),
        [1, 2, 3]
      );

      assert.deepStrictEqual(
        concat([1, 2, 3], []),
        [1, 2, 3]
      );

      assert.deepStrictEqual(
        concat([1], [2, 3]),
        [1, 2, 3]
      );

    });

  });

});
