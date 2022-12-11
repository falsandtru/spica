import { rnd16, rnd62, rnd0Z, rnd0_, unique, xorshift, pcg32 } from './random';
import { deviation } from './statistics';

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
      const rs = [...Array(1e5)].map(() => rnd62());
      const dist = rs.reduce((d, n) => (++d[n], d), Array(62).fill(0));
      console.debug('lib/random rnd62 deviation', deviation(dist) / (1e5 / dist.length), dist);
      assert(deviation(dist) / (1e5 / dist.length) < 0.05);
    });

  });

  describe('rnd0Z', () => {
    it('', () => {
      assert(rnd0Z());
      console.debug('lib/random rnd0Z', rnd0Z(32));
      assert(rnd0Z(1e3).includes('0'));
      assert(rnd0Z(1e3).includes('Z'));
    });

  });

  describe('rnd0_', () => {
    it('', () => {
      assert(rnd0_());
      console.debug('lib/random rnd0_', rnd0_(32));
      assert(rnd0_(1e3).includes('0'));
      assert(rnd0_(1e3).includes('_'));
    });

  });

  describe('unique', () => {
    it('', () => {
      const rng = unique(rnd0Z, 1);
      assert(1 - new Set([...Array(1e4)].map(() => rng())).size / 1e4 < 0.01);
    });

  });

  describe('xorshift', () => {
    it('uint', () => {
      const rng = xorshift();
      const dist = Array(16).fill(0);
      console.debug('lib/random xorshift uint', rng());
      console.debug('lib/random xorshift uint', rng());
      console.debug('lib/random xorshift uint', rng());
      for (let i = 0; i < 1e5; ++i) {
        const r = rng();
        // Low bits.
        ++dist[r % 16];
        assert(0 <= r && r < 2 ** 32);
      }
      console.debug('lib/random xorshift deviation low', deviation(dist) / (1e5 / dist.length), dist);
      assert(deviation(dist) / (1e5 / dist.length) < 0.03);
      console.debug('lib/random xorshift uint duplicate', 1 - new Set([...Array(1e5)].map(() => rng())).size / 1e5);
      assert(1 - new Set([...Array(1e5)].map(() => rng())).size / 1e5 < 0.01);
    });

    it('random', () => {
      const rng = xorshift.random();
      const dist = Array(16).fill(0);
      console.debug('lib/random xorshift random', rng());
      console.debug('lib/random xorshift random', rng());
      console.debug('lib/random xorshift random', rng());
      for (let i = 0; i < 1e5; ++i) {
        const r = rng();
        // High bits.
        ++dist[r * 16 | 0];
        assert(0 <= r && r < 1);
      }
      console.debug('lib/random xorshift deviation high', deviation(dist) / (1e5 / dist.length), dist);
      assert(deviation(dist) / (1e5 / dist.length) < 0.03);
      console.debug('lib/random xorshift random duplicate', 1 - new Set([...Array(1e5)].map(() => rng())).size / 1e5);
      assert(1 - new Set([...Array(1e5)].map(() => rng())).size / 1e5 < 0.01);
    });

  });

  describe('pcg32', () => {
    it('uint', () => {
      const rng = pcg32();
      const dist = Array(16).fill(0);
      console.debug('lib/random pcg32 uint', rng());
      console.debug('lib/random pcg32 uint', rng());
      console.debug('lib/random pcg32 uint', rng());
      for (let i = 0; i < 1e5; ++i) {
        const r = rng();
        ++dist[r % 16];
        assert(0 <= r && r < 2 ** 32);
      }
      console.debug('lib/random pcg32 deviation low', deviation(dist) / (1e5 / dist.length), dist);
      assert(deviation(dist) / (1e5 / dist.length) < 0.03);
      console.debug('lib/random pcg32 uint duplicate', 1 - new Set([...Array(1e5)].map(() => rng())).size / 1e5);
      assert(1 - new Set([...Array(1e5)].map(() => rng())).size / 1e5 < 0.01);
    });

    it('random', () => {
      const rng = pcg32.random();
      const dist = Array(16).fill(0);
      console.debug('lib/random pcg32 random', rng());
      console.debug('lib/random pcg32 random', rng());
      console.debug('lib/random pcg32 random', rng());
      for (let i = 0; i < 1e5; ++i) {
        const r = rng();
        ++dist[r * 16 | 0];
        assert(0 <= r && r < 1);
      }
      console.debug('lib/random pcg32 deviation high', deviation(dist) / (1e5 / dist.length), dist);
      assert(deviation(dist) / (1e5 / dist.length) < 0.03);
      console.debug('lib/random pcg32 random duplicate', 1 - new Set([...Array(1e5)].map(() => rng())).size / 1e5);
      assert(1 - new Set([...Array(1e5)].map(() => rng())).size / 1e5 < 0.01);
    });

    it('advance', () => {
      const state = BigInt(xorshift()());
      const inc = BigInt(xorshift()());
      assert(pcg32(pcg32.seed(state, inc))() === pcg32(pcg32.advance(pcg32.seed(state, inc), 0n))());
      const rng = pcg32(pcg32.advance(pcg32.seed(state, inc), -9n));
      for (let i = 0; i < 9; ++i) {
        rng();
      }
      assert(rng() === pcg32(pcg32.seed(state, inc))());
    });

  });

});
