import {AttrMap} from './attrmap';
import {DataMap} from './datamap';

describe('Unit: lib/attrmap', () => {
  describe('AttrMap', () => {
    it('initialize', () => {
      const map = new AttrMap<number, number, number>(<[number, number, number][]>[[1, 2, 3]], Map);
      assert(map.get(1, 2) === 3);
    });

    it('get/set', () => {
      const map = new AttrMap<number, number, string>([], Map);
      assert(map.get(0, 0) === void 0);
      assert(map.set(0, 0, '') === map);
      assert(map.get(0, 0) === '');
      assert(map.get(1, 0) === void 0);
      assert(map.set(1, 0, ' ') === map);
      assert(map.get(1, 0) === ' ');
      assert(map.get(0, 0) === '');
      assert(map.set(0, 0, ' ') === map);
      assert(map.get(0, 0) === ' ');
    });

    it('has', () => {
      const map = new AttrMap<{}, number, string>([], Map);
      assert(map.has(0, 0) === false);
      assert(map.set(0, 0, '') === map);
      assert(map.has(0, 0) === true);
      assert(map.has(1, 0) === false);
    });

    it('delete', () => {
      const map = new AttrMap<{}, number, string>([], Map);
      assert(map.set(0, 0, '') === map);
      assert(map.delete(0, 0) === true);
      assert(map.has(0, 0) === false);
      assert(map.delete(0, 0) === false);
      assert(map.delete(0) === true);
      assert(map.has(0, 0) === false);
      assert(map.delete(0) === false);
    });

    it('injection', () => {
      const map = new AttrMap<{}, number[], number>([], DataMap, DataMap);
      assert(map.set({}, [0], 0) === map);
      assert(map.get({}, [0]) === 0);
    });

  });

});
