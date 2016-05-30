import {Map} from './map';

describe('Unit: lib/map', () => {
  describe('Map', () => {
    it('get/set', () => {
      const map = new Map<number | string | Object, string>();
      assert(map.get(0) === void 0);
      assert(map.set(0, '') === '');
      assert(map.get(0) === '');
      assert(map.get(1) === void 0);
      assert(map.set(1, ' ') === ' ');
      assert(map.get(1) === ' ');
      assert(map.get(0) === '');
      assert(map.set(0, ' ') === ' ');
      assert(map.get(0) === ' ');

      assert(map.get('0') === void 0);
      assert(map.set('0', '0') === '0');
      assert(map.get('0') === '0');
      assert(map.get(0) === ' ');

      assert(map.get('') === void 0);
      assert(map.get(' ') === void 0);
      assert(map.set('', '') === '');
      assert(map.set(' ', ' ') === ' ');
      assert(map.get('') === '');
      assert(map.get(' ') === ' ');

      const o = {};
      assert(map.get('{}') === void 0);
      assert(map.get(o) === void 0);
      assert(map.set('{}', '') === '');
      assert(map.set(o, ' ') === ' ');
      assert(map.get('{}') === '');
      assert(map.get(o) === ' ');
    });

    it('has', () => {
      const map = new Map<number | {}, string>();
      assert(map.has(0) === false);
      assert(map.set(0, '') === '');
      assert(map.has(0) === true);
      assert(map.has(1) === false);
      const o = {};
      assert(map.has(o) === false);
      assert(map.set(o, '') === '');
      assert(map.has(o) === true);
      assert(map.has({}) === false);
    });

    it('delete', () => {
      const map = new Map<number | {}, string>();
      assert(map.set(0, '') === '');
      assert(map.delete(0) === void 0);
      assert(map.has(0) === false);
      const o = {};
      assert(map.set(o, '') === '');
      assert(map.delete(o) === void 0);
      assert(map.has(o) === false);
    });

    it('clear', () => {
      const map = new Map<number | {}, string>();
      assert(map.set(0, '') === '');
      assert(map.set(1, '') === '');
      assert(map.clear() === void 0);
      assert(map.has(0) === false);
      assert(map.has(1) === false);
      const o = {};
      assert(map.set(o, '') === '');
      assert(map.set({}, '') === '');
      assert(map.clear() === void 0);
      assert(map.has(o) === false);
      assert(map.has({}) === false);
    });

    it('size', () => {
      const map = new Map<number | {}, string>();
      const o = {};
      assert(map.size === 0);
      assert(map.size === 0);
      assert(map.set(0, '') === '');
      assert(map.size === 1);
      assert(map.set(0, '') === '');
      assert(map.size === 1);
      assert(map.set(1, '') === '');
      assert(map.size === 2);
      assert(map.delete(0) === void 0);
      assert(map.size === 1);
      assert(map.set(o, '') === '');
      assert(map.size === 2);
      assert(map.set({}, '') === '');
      assert(map.size === 3);
      assert(map.delete(o) === void 0);
      assert(map.size === 2);
      assert(map.clear() === void 0);
      assert(map.size === 0);
    });

    it('entries', () => {
      const map = new Map<number | Object, string>();
      assert.deepStrictEqual(map.entries(), [
      ]);
      assert(map.set(1, '') === '');
      assert(map.set('0', '') === '');
      assert(map.set(0, '') === '');
      assert.deepStrictEqual(map.entries(), [
        [0, ''],
        [1, ''],
        ['0', '']
      ]);
      assert(map.delete('0') === void 0);
      assert.deepStrictEqual(map.entries(), [
        [0, ''],
        [1, '']
      ]);
      assert(map.clear() === void 0);
      assert.deepStrictEqual(map.entries(), [
      ]);

      const o1 = {};
      const o2 = {};
      assert(map.set(o1, '') === '');
      assert(map.set(0, '') === '');
      assert(map.set(o2, '') === '');
      assert(map.size === 3);
      assert.deepStrictEqual(map.entries(), [
        [0, ''],
        [o1, ''],
        [o2, '']
      ]);
      assert(map.delete(o1) === void 0);
      assert(map.size === 2);
      assert.deepStrictEqual(map.entries(), [
        [0, ''],
        [o2, '']
      ]);
    });

  });

});
