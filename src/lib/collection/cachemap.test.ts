import {CacheMap} from './cachemap';

describe('Unit: lib/cachemap', () => {
  describe('CacheMap', () => {
    it('initialize', () => {
      const map = new CacheMap<number, number>(<[number, number][]>[[0, 1]]);
      assert(map.get(0) === 1);
    });

    it('get/set', () => {
      const map = new CacheMap<number, number>();
      assert(map.get(0) === void 0);
      assert(map.set(0, 1) === map);
      assert(map.get(0) === 1);
    });

    it('has', () => {
      const map = new CacheMap<number, number>();
      assert(map.has(0) === false);
      assert(map.set(0, 1) === map);
      assert(map.has(0) === true);
    });

    it('delete', () => {
      const map = new CacheMap<number, number>();
      assert(map.set(0, 1) === map);
      assert(map.delete(0) === true);
      assert(map.has(0) === false);
      assert(map.delete(0) === false);
    });

    it('expiry', done => {
      const map = new CacheMap<number, number>();
      assert(map.set(0, 1, 1000) === map);
      assert(map.get(0) === 1);
      setTimeout(function() {
        assert(map.has(0) === false);
        done();
      }, 1500);
    });

  });

});
