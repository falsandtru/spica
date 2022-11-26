import { LRU } from './lru';
import LRUCache from 'lru-cache';
import { pcg32 } from './random';

describe('Unit: lib/lru', () => {
  describe('LRU', () => {
    if (!navigator.userAgent.includes('Chrome')) return;

    it('even 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const isc = new LRUCache<number, 1>({ max: capacity });

      const trials = capacity * 1000;
      const random = pcg32.random(pcg32.seed(0n, 0n));
      let lruhit = 0;
      let ischit = 0;
      for (let i = 0; i < trials; ++i) {
        const key = random() * capacity * 10 | 0;
        lruhit += lru.get(key) ?? +lru.set(key, 1) & 0;
        ischit += isc.get(key) ?? +isc.set(key, 1) & 0;
      }
      console.debug('LRU even 100');
      console.debug('ISC hits', ischit);
      console.debug('LRU hits', lruhit);
      assert(lruhit === ischit);
    });

    it('uneven 100', function () {
      this.timeout(10 * 1e3);

      const capacity = 100;
      const lru = new LRU<number, 1>(capacity);
      const isc = new LRUCache<number, 1>({ max: capacity });

      const trials = capacity * 1000;
      const random = pcg32.random(pcg32.seed(0n, 0n));
      let lruhit = 0;
      let ischit = 0;
      for (let i = 0; i < trials; ++i) {
        const key = random() < 0.4
          ? random() * capacity * -1 | 0
          : random() * capacity * 10 | 0;
        lruhit += lru.get(key) ?? +lru.set(key, 1) & 0;
        ischit += isc.get(key) ?? +isc.set(key, 1) & 0;
      }
      console.debug('LRU uneven 100');
      console.debug('ISC hits', ischit);
      console.debug('LRU hits', lruhit);
      assert(lruhit === ischit);
    });

    it('uneven 1,000', function () {
      this.timeout(60 * 1e3);

      const capacity = 1000;
      const lru = new LRU<number, 1>(capacity);
      const isc = new LRUCache<number, 1>({ max: capacity });

      const trials = capacity * 1000;
      const random = pcg32.random(pcg32.seed(0n, 0n));
      let lruhit = 0;
      let ischit = 0;
      for (let i = 0; i < trials; ++i) {
        const key = random() < 0.4
          ? random() * capacity * -1 | 0
          : random() * capacity * 10 | 0;
        lruhit += lru.get(key) ?? +lru.set(key, 1) & 0;
        ischit += isc.get(key) ?? +isc.set(key, 1) & 0;
      }
      console.debug('LRU uneven 1000');
      console.debug('ISC hits', ischit);
      console.debug('LRU hits', lruhit);
      assert(lruhit === ischit);
    });

  });

});
