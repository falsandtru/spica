import {WeakMap} from './weakmap';

describe('Unit: lib/weakmap', () => {
  describe('WeakMap', () => {
    it('get/set', () => {
      const map = new WeakMap<{}, string>();
      const o1 = {};
      const o2 = {};
      assert(map.get(o1) === void 0);
      assert(map.set(o1, '') === '');
      assert(map.get(o1) === '');
      assert(map.get(o2) === void 0);
      assert(map.set(o2, ' ') === ' ');
      assert(map.get(o2) === ' ');
      assert(map.get(o1) === '');
      assert(map.set(o1, ' ') === ' ');
      assert(map.get(o1) === ' ');
    });

    it('has', () => {
      const map = new WeakMap<{}, string>();
      const o1 = {};
      const o2 = {};
      assert(map.has(o1) === false);
      assert(map.set(o1, '') === '');
      assert(map.has(o1) === true);
      assert(map.has(o2) === false);
      assert.deepStrictEqual(Object.keys(o1), []);
      assert.deepStrictEqual(Object.keys(o2), []);
    });

    it('delete', () => {
      const map = new WeakMap<{}, string>();
      const o1 = {};
      assert(map.set(o1, '') === '');
      assert(map.delete(o1) === void 0);
      assert(map.has(o1) === false);
    });

  });

});
