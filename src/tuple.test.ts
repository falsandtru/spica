import { tuple } from './tuple';

describe('Unit: lib/tuple', () => {
  describe('tuple', () => {
    it('', () => {
      assert((): [number] => tuple(0));
      assert((): [number, number] => tuple(0, 0));
    });

  });

});
