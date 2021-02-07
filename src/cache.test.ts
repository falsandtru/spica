import { Cache } from './cache';
import { Sequence } from './monad/sequence';

describe('Unit: lib/cache', () => {
  describe('Cache', () => {
    it('put/has/delete', () => {
      const cache = new Cache<number, number>(1, { mode: 'DW' });

      assert.deepStrictEqual([...cache], [
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [], []
      ]);

      assert(cache.has(0) === false);
      assert(cache.put(0, 0) === false);
      assert.deepStrictEqual([...cache], [
        [0, 0]
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [0], []
      ]);

      assert(cache.has(0) === true);
      assert(cache.put(0, 0) === true);
      assert.deepStrictEqual([...cache], [
        [0, 0]
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [], [0]
      ]);

      assert(cache.has(0) === true);
      assert(cache.put(0, 0) === true);
      assert.deepStrictEqual([...cache], [
        [0, 0]
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [], [0]
      ]);

      assert(cache.has(0) === true);
      assert(cache.delete(0) === true);
      assert(cache.delete(0) === false);
      assert.deepStrictEqual([...cache], [
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [], []
      ]);
    });

    it('set', () => {
      assert(new Cache<number, number>(1).set(0, 1) instanceof Cache);
    });

    it('LRU', () => {
      let key: number | undefined;
      let val: number | undefined;
      let cnt = 0;
      const cache = new Cache<number, number>(1, { mode: 'DW', disposer: (k, v) => (key = k, val = v, ++cnt) });

      assert.deepStrictEqual(cache.inspect(), [
        [], []
      ]);

      assert(cache.put(0, 0) === false);
      assert(key === undefined && val === undefined && cnt === 0);
      assert(cache.put(1, 1) === false);
      assert(key === 0 && val === 0 && cnt === 1);
      assert.deepStrictEqual([...cache], [
        [1, 1]
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [1], []
      ]);
      assert(cache.put(0, 0) === false);
      assert(key === 1 && val === 1 && cnt === 2);
      assert.deepStrictEqual([...cache], [
        [0, 0]
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [0], []
      ]);
      assert(cache.put(2, 2) === false);
      assert(key === 0 && val === 0 && cnt === 3);
      assert.deepStrictEqual([...cache], [
        [2, 2]
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [2], []
      ]);
    });

    it('LFU', () => {
      let key: number | undefined;
      let val: number | undefined;
      let cnt = 0;
      const cache = new Cache<number, number>(1, { mode: 'DW', disposer: (k, v) => (key = k, val = v, ++cnt) });

      assert.deepStrictEqual(cache.inspect(), [
        [], []
      ]);

      assert(cache.put(0, 0) === false);
      assert(key === undefined && val === undefined && cnt === 0);
      assert(cache.put(0, 0) === true);
      assert(cache.put(1, 1) === false);
      assert(key === 0 && val === 0 && cnt === 1);
      assert(cache.put(1, 1) === true);
      assert.deepStrictEqual(cache.export(), {
        indexes: [[], [1]],
        entries: [[1, 1]],
      });
      assert(cache.put(0, 0) === false);
      assert(key === 1 && val === 1 && cnt === 2);
      assert.deepStrictEqual(cache.export(), {
        indexes: [[0], []],
        entries: [[0, 0]],
      });
      assert(cache.put(2, 2) === false);
      assert(key === 0 && val === 0 && cnt === 3);
      assert(cache.put(2, 2) === true);
      assert.deepStrictEqual(cache.export(), {
        indexes: [[], [2]],
        entries: [[2, 2]],
      });
    });

    it('DWC', () => {
      let key: number | undefined;
      let val: number | undefined;
      let cnt = 0;
      const cache = new Cache<number, number>(2, { mode: 'DW', disposer: (k, v) => (key = k, val = v, ++cnt) });

      assert.deepStrictEqual(cache.inspect(), [
        [], []
      ]);

      assert(cache.put(0, 0) === false);
      assert(key === undefined && val === undefined && cnt === 0);
      assert(cache.put(1, 1) === false);
      assert(key === undefined && val === undefined && cnt === 0);
      assert(cache.put(1, 1) === true);
      assert(cache.put(2, 2) === false);
      assert(key === 0 && val === 0 && cnt === 1);
      assert(cache.put(2, 2) === true);
      assert(cache.put(0, 0) === false);
      assert(key === 1 && val === 1 && cnt === 2);
      assert(cache.put(3, 3) === false);
      assert(key === 0 && val === 0 && cnt === 3);
      assert.deepStrictEqual(cache.export(), {
        indexes: [[3], [2]],
        entries: [[2, 2], [3, 3]],
      });

      assert(cache.clear() === undefined);
      assert(key === 3 && val === 3 && cnt === 5);
      assert.deepStrictEqual([...cache], [
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [], []
      ]);
    });

    it('condition', () => {
      const capacity = 10;
      const cache = new Cache<number, number>(capacity, { mode: 'DW' });

      for (let i = 0; i < 10000; ++i) {
        cache.put((Math.random() * capacity * 4 | 0) + i, i);
      }
      const [LRU, LFU] = cache.inspect();
      assert(LRU.every(k => cache.has(k)));
      assert(LFU.every(k => cache.has(k)));
      assert(LRU.length + LFU.length === capacity);
      assert([...cache].length === capacity);
      assert(
        Sequence.union(Sequence.from(LRU).sort(), Sequence.from(LFU).sort(), (a, b) => a - b)
          .extract()
          .length === capacity);
    });

    class LRUCache<K, V> {
      constructor(public capacity: number) {
      }
      indexes: K[] = [];
      entries = new Map<K, V>();
      put(key: K, val: V): boolean {
        const i = this.indexes.indexOf(key);
        if (this.indexes.length === this.capacity) {
          i === -1
            ? this.indexes.pop()
            : this.indexes.splice(i, 1);
        }
        this.indexes.unshift(key);
        this.entries.set(key, val);
        return i > -1;
      }
    }

    it('rate even', function () {
      this.timeout(5 * 1e3);
      this.retries(3);

      const capacity = 100;
      const dwc = new Cache<number, number>(capacity, { mode: 'DW' });
      const lru = new LRUCache<number, number>(capacity);

      const repeat = 100000;
      const warmup = capacity * 100;
      let hitdwc = 0;
      let hitlru = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        const key = Math.random() * capacity * 9 | 0;
        hitdwc += +dwc.put(key, i);
        hitlru += +lru.put(key, i);
        if (i + 1 === warmup) {
          hitdwc = 0;
          hitlru = 0;
        }
      }
      console.debug('DWC hit rate even', hitdwc * 100 / repeat);
      console.debug('LRU hit rate even', hitlru * 100 / repeat);
      console.debug('Cache ratio even', dwc['ratio']);
      assert(hitdwc * 100 / repeat - hitlru * 100 / repeat > -0.5);
    });

    it('rate uneven', function () {
      this.timeout(5 * 1e3);
      this.retries(3);

      const capacity = 100;
      const dwc = new Cache<number, number>(capacity, { mode: 'DW' });
      const lru = new LRUCache<number, number>(capacity);

      const repeat = 100000;
      const warmup = capacity * 100;
      let hitdwc = 0;
      let hitlru = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        const key = Math.random() < 0.2
          ? Math.random() * capacity * 1 | 0
          : Math.random() * capacity * 9 | 0;
        hitdwc += +dwc.put(key, i);
        hitlru += +lru.put(key, i);
        if (i + 1 === warmup) {
          hitdwc = 0;
          hitlru = 0;
        }
      }
      console.debug('DWC hit rate uneven', hitdwc * 100 / repeat);
      console.debug('LRU hit rate uneven', hitlru * 100 / repeat);
      console.debug('Cache ratio uneven', dwc['ratio']);
      assert(hitdwc * 100 / repeat - hitlru * 100 / repeat > 3);
      //assert(hitdwc * 100 / repeat - hitlru * 100 / repeat > 3.5);
    });

  });

});
