import { Cache } from './cache';

describe('Unit: lib/cache', () => {
  describe('Cache', () => {
    function inspect<K, V>(cache: Cache<K, V>) {
      return {
        LRU: cache['indexes'].LRU,
        LFU: cache['indexes'].LFU,
        store: [...cache['store']],
      };
    }

    it('put/has/delete 1', () => {
      const cache = new Cache<number, number>(1);

      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        store: [],
      });

      assert(cache.has(0) === false);
      assert(cache.get(0) === undefined);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        store: [],
      });

      assert(cache.has(0) === false);
      assert(cache.put(0, 0) === false);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [0],
        LFU: [],
        store: [[0, 0]],
      });

      assert(cache.has(0) === true);
      assert(cache.put(0, 1) === true);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [0],
        LFU: [],
        store: [[0, 1]],
      });

      assert(cache.get(0) === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [0],
        store: [[0, 1]],
      });

      assert(cache.has(0) === true);
      assert(cache.put(0, 0) === true);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [0],
        store: [[0, 0]],
      });

      assert(cache.get(0) === 0);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [0],
        store: [[0, 0]],
      });

      assert(cache.has(0) === true);
      assert(cache.delete(0) === true);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        store: [],
      });

      assert(cache.delete(0) === false);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        store: [],
      });
    });

    it('put/has/delete 2', () => {
      let key: number | undefined;
      let val: number | undefined;
      let cnt = 0;
      const cache = new Cache<number, number>(2, { disposer: (k, v) => (key = k, val = v, ++cnt) });

      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        store: [],
      });

      assert(cache.put(0, 0) === false);
      assert(key === undefined && val === undefined && cnt === 0);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [0],
        LFU: [],
        store: [[0, 0]],
      });

      assert(cache.put(1, 1) === false);
      assert(key === undefined && val === undefined && cnt === 0);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1, 0],
        LFU: [],
        store: [[0, 0], [1, 1]],
      });

      assert(cache.put(1, 1) === true);
      assert(key === undefined && val === undefined && cnt === 0);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [1, 0],
        LFU: [],
        store: [[0, 0], [1, 1]],
      });

      assert(cache.get(1) === 1);
      assert(key === undefined && val === undefined && cnt === 0);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [0],
        LFU: [1],
        store: [[0, 0], [1, 1]],
      });

      assert(cache.put(2, 2) === false);
      assert(key === 0 && val === 0 && cnt === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [2],
        LFU: [1],
        store: [[1, 1], [2, 2]],
      });

      assert(cache.get(2) === 2);
      assert(key === 0 && val === 0 && cnt === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [2, 1],
        store: [[1, 1], [2, 2]],
      });

      assert(cache.get(2) === 2);
      assert(key === 0 && val === 0 && cnt === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [2, 1],
        store: [[1, 1], [2, 2]],
      });

      assert(cache.get(1) === 1);
      assert(key === 0 && val === 0 && cnt === 1);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [1, 2],
        store: [[1, 1], [2, 2]],
      });

      assert(cache.put(3, 3) === false);
      assert(key === 2 && val === 2 && cnt === 2);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [3],
        LFU: [1],
        store: [[1, 1], [3, 3]],
      });

      assert(cache.clear() === undefined);
      assert(key === 3 && val === 3 && cnt === 4);
      assert.deepStrictEqual(inspect(cache), {
        LRU: [],
        LFU: [],
        store: [],
      });
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

    it('rate even 10', function () {
      this.timeout(10 * 1e3);
      this.retries(3);

      const capacity = 10;
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
        const hit = dwc.put(key, i);
        hitdwc += +hit;
        hit && dwc.get(key);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitlfu = 0;
          hitdwc = 0;
        }
      }
      console.debug('LRU hit rate even 10', hitlru * 100 / repeat);
      console.debug('LFU hit rate even 10', hitlfu * 100 / repeat);
      console.debug('DWC hit rate even 10', hitdwc * 100 / repeat);
      console.debug('LRU cache ratio even 10', dwc['ratio']);
      assert(hitdwc * 100 / repeat - hitlru * 100 / repeat > -0.2);
    });

    it('rate uneven 10', function () {
      this.timeout(10 * 1e3);
      this.retries(3);

      const capacity = 10;
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
        const hit = dwc.put(key, i);
        hitdwc += +hit;
        hit && dwc.get(key);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitlfu = 0;
          hitdwc = 0;
        }
      }
      console.debug('LRU hit rate uneven 10', hitlru * 100 / repeat);
      console.debug('LFU hit rate uneven 10', hitlfu * 100 / repeat);
      console.debug('DWC hit rate uneven 10', hitdwc * 100 / repeat);
      console.debug('LRU cache ratio uneven 10', dwc['ratio']);
      assert(hitdwc * 100 / repeat - hitlru * 100 / repeat > 12);
    });

    it('rate even 100', function () {
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
        const hit = dwc.put(key, i);
        hitdwc += +hit;
        hit && dwc.get(key);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitlfu = 0;
          hitdwc = 0;
        }
      }
      console.debug('LRU hit rate even 100', hitlru * 100 / repeat);
      console.debug('LFU hit rate even 100', hitlfu * 100 / repeat);
      console.debug('DWC hit rate even 100', hitdwc * 100 / repeat);
      console.debug('LRU cache ratio even 100', dwc['ratio']);
      assert(hitdwc * 100 / repeat - hitlru * 100 / repeat > -0.2);
    });

    it('rate uneven 100', function () {
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
        const hit = dwc.put(key, i);
        hitdwc += +hit;
        hit && dwc.get(key);
        if (i + 1 === warmup) {
          hitlru = 0;
          hitlfu = 0;
          hitdwc = 0;
        }
      }
      console.debug('LRU hit rate uneven 100', hitlru * 100 / repeat);
      console.debug('LFU hit rate uneven 100', hitlfu * 100 / repeat);
      console.debug('DWC hit rate uneven 100', hitdwc * 100 / repeat);
      console.debug('LRU cache ratio uneven 100', dwc['ratio']);
      assert(hitdwc * 100 / repeat - hitlru * 100 / repeat > 13);
    });

  });

});
