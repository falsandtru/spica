import {Cache} from './cache';
import {Sequence} from './monad/sequence';

describe('Unit: lib/cache', () => {
  describe('Cache', () => {
    it('add/has/delete', () => {
      const cache = new Cache<number, number>(1);

      assert.deepStrictEqual(Array.from(cache), [
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [], []
      ]);

      assert(cache.has(0) === false);
      assert(cache.put(0, 0) === false);
      assert.deepStrictEqual(Array.from(cache), [
        [0, 0]
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [0], []
      ]);

      assert(cache.has(0) === true);
      assert(cache.put(0, 0) === true);
      assert.deepStrictEqual(Array.from(cache), [
        [0, 0]
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [], [0]
      ]);

      assert(cache.has(0) === true);
      assert(cache.put(0, 0) === true);
      assert.deepStrictEqual(Array.from(cache), [
        [0, 0]
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [], [0]
      ]);

      assert(cache.has(0) === true);
      assert(cache.delete(0) === true);
      assert(cache.delete(0) === false);
      assert.deepStrictEqual(Array.from(cache), [
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [], []
      ]);
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
      assert(key === void 0 && val === void 0 && cnt === 0);
      assert(cache.put(1, 1) === false);
      assert(key === 0 && val === 0 && cnt === 1);
      assert.deepStrictEqual(Array.from(cache), [
        [1, 1]
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [1], []
      ]);
      assert(cache.put(0, 0) === false);
      assert(key === 1 && val === 1 && cnt === 2);
      assert.deepStrictEqual(Array.from(cache), [
        [0, 0]
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [0], []
      ]);
      assert(cache.put(2, 2) === false);
      assert(key === 0 && val === 0 && cnt === 3);
      assert.deepStrictEqual(Array.from(cache), [
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
      assert(key === void 0 && val === void 0 && cnt === 0);
      assert(cache.put(0, 0) === true);
      assert(cache.put(1, 1) === false);
      assert(key === 0 && val === 0 && cnt === 1);
      assert(cache.put(1, 1) === true);
      assert.deepStrictEqual(Array.from(cache), [
        [1, 1]
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [], [1]
      ]);
      assert(cache.put(0, 0) === false);
      assert(key === 1 && val === 1 && cnt === 2);
      assert.deepStrictEqual(Array.from(cache), [
        [0, 0]
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [0], []
      ]);
      assert(cache.put(2, 2) === false);
      assert(key === 0 && val === 0 && cnt === 3);
      assert(cache.put(2, 2) === true);
      assert.deepStrictEqual(Array.from(cache), [
        [2, 2]
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [], [2]
      ]);
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
      assert(key === void 0 && val === void 0 && cnt === 0);
      assert(cache.put(1, 1) === false);
      assert(key === void 0 && val === void 0 && cnt === 0);
      assert(cache.put(1, 1) === true);
      assert(cache.put(2, 2) === false);
      assert(key === 0 && val === 0 && cnt === 1);
      assert(cache.put(2, 2) === true);
      assert(cache.put(0, 0) === false);
      assert(key === 1 && val === 1 && cnt === 2);
      assert(cache.put(3, 3) === false);
      assert(key === 0 && val === 0 && cnt === 3);
      assert.deepStrictEqual(Array.from(cache), [
        [2, 2], [3, 3]
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [3], [2]
      ]);

      assert(cache.clear() === void 0);
      assert(key === 3 && val === 3 && cnt === 5);
      assert.deepStrictEqual(Array.from(cache), [
      ]);
      assert.deepStrictEqual(cache.inspect(), [
        [], []
      ]);
    });

    it('condition', () => {
      const size = 10;
      const cache = new Cache<number, number>(size);

      for (let i = 0; i < 10000; ++i) {
        cache.put((Math.random() * size * 4 | 0) + i, i);
      }
      const [LRU, LFU] = cache.inspect();
      assert(LRU.every(k => cache.has(k)));
      assert(LFU.every(k => cache.has(k)));
      assert(LRU.length + LFU.length === size);
      assert(Array.from(cache).length === size);
      assert(
        Sequence.union(Sequence.from(LRU).sort(), Sequence.from(LFU).sort(), (a, b) => a - b)
          .extract()
          .length === size);
    });

    it('rate', function (this: any) {
      this.timeout(10 * 1e3);

      const size = 10;
      const cache = new Cache<number, number>(size);

      const repeat = size * 10000;
      let lrf = 0;
      let lru = 0;
      const LRU: number[] = [];
      for (let i = 0; i < repeat; ++i) {
        let key = Math.random() * size * 10 | 0;
        key = key < size * 8 ? key % (size * 4) | 0 : key;
        lrf += +cache.put(key, i);
        {
          const idx = LRU.indexOf(key);
          lru += +(idx > -1);
          LRU.unshift(idx === -1 ? key : LRU.splice(idx, 1)[0]);
          LRU.length = size;
        }
      }
      console.log('LRF cache hit rate', lrf / repeat * 100);
      console.log('LRU cache hit rate', lru / repeat * 100);
      assert(lrf / repeat * 100 > lru / repeat * 100);
      assert(lrf / repeat * 100 > 18 - 0.1);
    });

  });

});
