import { Cache } from './cache';
import { Sequence } from './monad/sequence';

describe('Unit: lib/cache', () => {
  describe('Cache', () => {
    function inspect<K>(cache: Cache<K, any>): [K[], K[]] {
      const { LRU, LFU } = cache['indexes'];
      return [LRU.slice(), LFU.slice()];
    }

    it('put/has/delete', () => {
      const cache = new Cache<number, number>(1, { mode: 'DW' });

      assert.deepStrictEqual([...cache], [
      ]);
      assert.deepStrictEqual(inspect(cache), [
        [], []
      ]);

      assert(cache.has(0) === false);
      assert(cache.put(0, 0) === false);
      assert.deepStrictEqual([...cache], [
        [0, 0]
      ]);
      assert.deepStrictEqual(inspect(cache), [
        [0], []
      ]);

      assert(cache.has(0) === true);
      assert(cache.put(0, 0) === true);
      assert.deepStrictEqual([...cache], [
        [0, 0]
      ]);
      assert.deepStrictEqual(inspect(cache), [
        [], [0]
      ]);

      assert(cache.has(0) === true);
      assert(cache.put(0, 0) === true);
      assert.deepStrictEqual([...cache], [
        [0, 0]
      ]);
      assert.deepStrictEqual(inspect(cache), [
        [], [0]
      ]);

      assert(cache.has(0) === true);
      assert(cache.delete(0) === true);
      assert(cache.delete(0) === false);
      assert.deepStrictEqual([...cache], [
      ]);
      assert.deepStrictEqual(inspect(cache), [
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

      assert.deepStrictEqual(inspect(cache), [
        [], []
      ]);

      assert(cache.put(0, 0) === false);
      assert(key === undefined && val === undefined && cnt === 0);
      assert(cache.put(1, 1) === false);
      assert(key === 0 && val === 0 && cnt === 1);
      assert.deepStrictEqual([...cache], [
        [1, 1]
      ]);
      assert.deepStrictEqual(inspect(cache), [
        [1], []
      ]);
      assert(cache.put(0, 0) === false);
      assert(key === 1 && val === 1 && cnt === 2);
      assert.deepStrictEqual([...cache], [
        [0, 0]
      ]);
      assert.deepStrictEqual(inspect(cache), [
        [0], []
      ]);
      assert(cache.put(2, 2) === false);
      assert(key === 0 && val === 0 && cnt === 3);
      assert.deepStrictEqual([...cache], [
        [2, 2]
      ]);
      assert.deepStrictEqual(inspect(cache), [
        [2], []
      ]);
    });

    it('LFU', () => {
      let key: number | undefined;
      let val: number | undefined;
      let cnt = 0;
      const cache = new Cache<number, number>(1, { mode: 'DW', disposer: (k, v) => (key = k, val = v, ++cnt) });

      assert.deepStrictEqual(inspect(cache), [
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

      assert.deepStrictEqual(inspect(cache), [
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
      assert.deepStrictEqual(inspect(cache), [
        [], []
      ]);
    });

    it('condition', () => {
      const capacity = 10;
      const cache = new Cache<number, number>(capacity, { mode: 'DW' });

      for (let i = 0; i < 10000; ++i) {
        cache.put((Math.random() * capacity * 4 | 0) + i, i);
      }
      const [LRU, LFU] = inspect(cache);
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
      public indexes: K[] = [];
      public entries = new Map<K, V>();
      public put(key: K, val: V): boolean {
        const { indexes, entries } = this;
        const i = indexes.indexOf(key);
        if (indexes.length === this.capacity) {
          i === -1
            ? entries.delete(indexes.pop()!)
            : indexes.splice(i, 1);
        }
        else {
          i > -1 && indexes.splice(i, 1);
        }
        indexes.unshift(key);
        entries.set(key, val);
        assert(indexes.length <= this.capacity);
        assert(indexes.length === entries.size);
        return i > -1;
      }
    }

    class LFUCache<K, V> {
      constructor(public capacity: number) {
      }
      public indexes: K[] = [];
      public entries = new Map<K, V>();
      public put(key: K, val: V): boolean {
        const { indexes, entries } = this;
        const i = indexes.indexOf(key);
        switch (i) {
          case -1:
            indexes.length === this.capacity && entries.delete(indexes.pop()!);
            indexes.unshift(key);
            break;
          case 0:
            break;
          default:
            [indexes[i - 1], indexes[i]] = [indexes[i], indexes[i - 1]];
        }
        entries.set(key, val);
        assert(indexes.length <= this.capacity);
        assert(indexes.length === entries.size);
        return i > -1;
      }
    }

    it('rate even', function () {
      this.timeout(10 * 1e3);
      this.retries(3);

      const capacity = 100;
      const lru = new LRUCache<number, number>(capacity);
      const lfu = new LFUCache<number, number>(capacity);
      const dwc = new Cache<number, number>(capacity);

      const repeat = capacity * 1000;
      const warmup = capacity * 1000;
      let hitlru = 0;
      let hitlfu = 0;
      let hitdwc = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        const key = Math.random() * capacity * 10 | 0;
        hitlru += +lru.put(key, i);
        hitlfu += +lfu.put(key, i);
        hitdwc += +dwc.put(key, i);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitlfu = 0;
          hitdwc = 0;
        }
      }
      console.debug('LRU hit rate even', hitlru * 100 / repeat);
      console.debug('LFU hit rate even', hitlfu * 100 / repeat);
      console.debug('DWC hit rate even', hitdwc * 100 / repeat);
      console.debug('LRU cache ratio even', dwc['ratio']);
      assert(hitdwc * 100 / repeat - hitlru * 100 / repeat > -0.2);
    });

    it('rate uneven', function () {
      this.timeout(10 * 1e3);
      this.retries(3);

      const capacity = 100;
      const lru = new LRUCache<number, number>(capacity);
      const lfu = new LFUCache<number, number>(capacity);
      const dwc = new Cache<number, number>(capacity);

      const repeat = capacity * 1000;
      const warmup = capacity * 1000;
      let hitlru = 0;
      let hitlfu = 0;
      let hitdwc = 0;
      for (let i = 0; i < repeat + warmup; ++i) {
        const key = Math.random() < 0.4
          ? Math.random() * capacity * 1 | 0
          : Math.random() * capacity * 9 + capacity | 0;
        hitlru += +lru.put(key, i);
        hitlfu += +lfu.put(key, i);
        hitdwc += +dwc.put(key, i);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitlfu = 0;
          hitdwc = 0;
        }
      }
      console.debug('LRU hit rate uneven', hitlru * 100 / repeat);
      console.debug('LFU hit rate uneven', hitlfu * 100 / repeat);
      console.debug('DWC hit rate uneven', hitdwc * 100 / repeat);
      console.debug('LRU cache ratio uneven', dwc['ratio']);
      assert(hitdwc * 100 / repeat - hitlru * 100 / repeat > 13);
    });

  });

});
