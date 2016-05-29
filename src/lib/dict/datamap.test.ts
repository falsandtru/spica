import {DataMap} from './datamap';

describe('Unit: lib/datamap', () => {
  describe('DataMap', () => {
    it('get/set', () => {
      const map = new DataMap<string[], string>();
      assert(map.get([]) === void 0);
      assert(map.set([], '') === '');
      assert(map.get([]) === '');
      assert(map.get(['']) === void 0);
      assert(map.set([''], ' ') === ' ');
      assert(map.get(['']) === ' ');
      assert(map.get([]) === '');
      assert(map.set([], ' ') === ' ');
      assert(map.get([]) === ' ');
    });

    it('has', () => {
      const map = new DataMap<string[], string>();
      assert(map.has([]) === false);
      assert(map.set([], '') === '');
      assert(map.has([]) === true);
      assert(map.has(['']) === false);
    });

    it('delete', () => {
      const map = new DataMap<string[], string>();
      assert(map.set([], '') === '');
      assert(map.delete([]) === void 0);
      assert(map.has([]) === false);
    });

    it('clear', () => {
      const map = new DataMap<string[], string>();
      assert(map.set([], '') === '');
      assert(map.clear() === void 0);
      assert(map.has([]) === false);
    });

    it('size', () => {
      const map = new DataMap<string[], string>();
      assert(map.size === 0);
      assert(map.size === 0);
      assert(map.set([], '') === '');
      assert(map.size === 1);
      assert(map.set([], '') === '');
      assert(map.size === 1);
      assert(map.set([''], '') === '');
      assert(map.size === 2);
      assert(map.delete([]) === void 0);
      assert(map.size === 1);
      assert(map.clear() === void 0);
      assert(map.size === 0);
    });

    it('entries', () => {
      const map = new DataMap<number[], string>();
      assert.deepStrictEqual(map.entries(), [
      ]);
      assert(map.set([], '') === '');
      assert(map.set([0], ' ') === ' ');
      assert(map.set([0, 1], ' ') === ' ');
      assert.deepStrictEqual(map.entries(), [
        [[], ''],
        [[0], ' '],
        [[0, 1], ' ']
      ]);
      assert(map.delete([0]) === void 0);
      assert.deepStrictEqual(map.entries(), [
        [[], ''],
        [[0, 1], ' ']
      ]);
      assert(map.clear() === void 0);
      assert.deepStrictEqual(map.entries(), [
      ]);
    });

  });

});
