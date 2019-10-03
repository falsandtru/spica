import { flip } from './flip';
import { curry } from './curry';

describe('Unit: lib/flip', () => {
  describe('flip', () => {
    it('uncurried', () => {
      assert(flip((n: number, m: number) => n / m)(1, 0) === 0);
    });

    it('curried', () => {
      assert(flip(curry((n: number, m: number) => n / m))(1)(0) === 0);
    });

    it('generic', () => {
      assert(flip(<T extends 0, U extends 1>(n: T, m: U) => n / m)(1, 0) === 0);
    });

  });

});
