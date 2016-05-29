import {AttrMap} from './attrmap';

describe('Unit: lib/attrmap', () => {
  describe('AttrMap', () => {
    it('get/set', () => {
      const map = new AttrMap<{}, number, string>();
      const o1 = {};
      const o2 = {};
      assert(map.get(o1, 0) === void 0);
      assert(map.set(o1, 0, '') === '');
      assert(map.get(o1, 0) === '');
      assert(map.get(o2, 0) === void 0);
      assert(map.set(o2, 0, ' ') === ' ');
      assert(map.get(o2, 0) === ' ');
      assert(map.get(o1, 0) === '');
      assert(map.set(o1, 0, ' ') === ' ');
      assert(map.get(o1, 0) === ' ');
    });

    it('has', () => {
      const map = new AttrMap<{}, number, string>();
      const o1 = {};
      const o2 = {};
      assert(map.has(o1, 0) === false);
      assert(map.set(o1, 0, '') === '');
      assert(map.has(o1, 0) === true);
      assert(map.has(o2, 0) === false);
      assert.deepStrictEqual(Object.keys(o1), []);
      assert.deepStrictEqual(Object.keys(o2), []);
    });

    it('delete', () => {
      const map = new AttrMap<{}, number, string>();
      const o1 = {};
      assert(map.set(o1, 0, '') === '');
      assert(map.delete(o1, 0) === void 0);
      assert(map.has(o1, 0) === false);
      assert(map.delete(o1) === void 0);
      assert(map.has(o1, 0) === false);
    });

  });

});
