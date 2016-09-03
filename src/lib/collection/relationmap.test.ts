import {RelationMap} from './relationmap';

describe('Unit: lib/relationmap', () => {
  describe('RelationMap', () => {
    it('initialize', () => {
      const o1 = {};
      const o2 = {};
      const map = new RelationMap<{}, {}, number>(<[{}, {}, number][]>[[o1, o2, 1]]);
      assert(map.get(o1, o2) === 1);
    });

    it('get/set', () => {
      const map = new RelationMap<{}, {}, string>();
      const o1 = {};
      const o2 = {};
      assert(map.get(o1, o2) === void 0);
      map.set(o1, o2, '');
      assert(map.get(o1, o2) === '');
      assert(map.get(o2, o1) === void 0);
      map.set(o2, o1, ' ');
      assert(map.get(o2, o1) === ' ');
      assert(map.get(o1, o2) === '');
      map.set(o1, o2, ' ');
      assert(map.get(o1, o2) === ' ');
    });

    it('has', () => {
      const map = new RelationMap<{}, {}, string>();
      const o1 = {};
      const o2 = {};
      assert(map.has(o1, o2) === false);
      map.set(o1, o2, '');
      assert(map.has(o1, o2) === true);
      assert(map.has(o2, o1) === false);
      assert.deepStrictEqual(Object.keys(o1), []);
      assert.deepStrictEqual(Object.keys(o2), []);
    });

    it('delete', () => {
      const map = new RelationMap<{}, {}, string>();
      const o1 = {};
      const o2 = {};
      map.set(o1, o2, '');
      assert(map.delete(o1, o2) === true);
      assert(map.has(o1, o2) === false);
      assert(map.delete(o1, o2) === false);
      assert(map.delete(o1) === true);
      assert(map.has(o1, o2) === false);
      assert(map.delete(o1) === false);
    });

  });

});
