import { rnd16, rnd62, rnd0z, rnd0Z, rnd36, unique } from './random';

describe('Unit: lib/random', () => {
  describe('rnd16', () => {
    it('', () => {
      assert(rnd16() >= 0);
      assert(rnd16() < 16);
    });

  });

  describe('rnd36', () => {
    it('', () => {
      assert(rnd36() >= 0);
      assert(rnd36() < 36);
      const rs = [...Array(9999)].map(() => rnd36());
      const dist = rs.reduce((d, n) => (++d[n], d), Array<0>(36).fill(0));
      console.debug('lib/random rnd36 distribution', dist);
      assert(dist[0] > dist[dist.length / 2 | 0] / 2);
      assert(dist[dist.length - 1] > dist[dist.length / 2 | 0] / 2);
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

  describe('rnd0z', () => {
    it('', () => {
      assert(rnd0z());
      console.debug('lib/random rnd0z', rnd0z(32));
      assert(rnd0z(999).includes('0'));
      assert(rnd0z(999).includes('z'));
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

  describe('unique', () => {
    it('', () => {
      const gen = unique(rnd0Z, 1);
      assert(gen());
      console.debug('lib/random unique rnd0Z', [...Array(62)].map(() => gen()).join(' '));
    });

  });

});

