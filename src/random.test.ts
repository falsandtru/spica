import { rnd16, rnd62, rnd0Z, rnd0_, unique } from './random';

describe('Unit: lib/random', () => {
  describe('rnd16', () => {
    it('', () => {
      assert(rnd16() >= 0);
      assert(rnd16() < 16);
    });

  });

  describe('rnd62', () => {
    it('', () => {
      assert(rnd62() >= 0);
      assert(rnd62() < 62);
      const rs = [...Array(9999)].map(() => rnd62());
      const dist = rs.reduce((d, n) => (++d[n], d), Array<0>(62).fill(0));
      console.debug('lib/random rnd62 distribution', dist);
      assert(dist[0] > dist[dist.length / 2 | 0] / 2);
      assert(dist[dist.length - 1] > dist[dist.length / 2 | 0] / 2);
    });

  });

  describe('rnd0Z', () => {
    it('', () => {
      assert(rnd0Z());
      console.debug('lib/random rnd0Z', rnd0Z(32));
      assert(rnd0Z(999).includes('0'));
      assert(rnd0Z(999).includes('Z'));
    });

  });

  describe('rnd0_', () => {
    it('', () => {
      assert(rnd0_());
      console.debug('lib/random rnd0_', rnd0_(32));
      assert(rnd0_(999).includes('0'));
      assert(rnd0_(999).includes('_'));
    });

  });

  describe('unique', () => {
    it('', () => {
      const gen = unique(rnd0Z, 1);
      assert(new Set([...Array(999)].map(() => gen())).size === 999);
    });

  });

});

