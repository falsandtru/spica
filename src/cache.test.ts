import { Cache } from './cache';
import { Sequence } from './monad/sequence';

describe('Unit: lib/cache', () => {
  describe('Cache', () => {
    it('put/has/delete', () => {
      const cache = new Cache<number, number>(1);

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
      const cache = new Cache<number, number>(1, (k, v) => (key = k, val = v, ++cnt));

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
      const cache = new Cache<number, number>(1, (k, v) => (key = k, val = v, ++cnt));

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

    it('LRF', () => {
      let key: number | undefined;
      let val: number | undefined;
      let cnt = 0;
      const cache = new Cache<number, number>(2, (k, v) => (key = k, val = v, ++cnt));

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
      const cache = new Cache<number, number>(capacity);

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

    it('rate', function () {
      this.timeout(10 * 1e3);
      this.retries(3);

      const capacity = 100;
      const cache = new Cache<number, number>(capacity);

      const range = capacity * 10;
      const repeat = 100000;
      let lrf = 0;
      let lru = 0;
      const LRU: number[] = [];
      for (let i = 0; i < repeat; ++i) {
        let key = Math.floor(Math.random() * range + i / 100);
        if (key < capacity * 8) {
          key = Math.floor(key / 8);
        }
        lrf += +cache.put(key, i);
        const idx = LRU.indexOf(key);
        lru += +(idx > -1);
        LRU.unshift(idx === -1 ? key : LRU.splice(idx, 1)[0]);
        LRU.length = capacity;
      }
      console.debug('LRF cache hit rate', lrf * 100 / repeat);
      console.debug('LRU cache hit rate', lru * 100 / repeat);
      assert(lrf * 100 / repeat > lru * 100 / repeat);
    });

  });

});
