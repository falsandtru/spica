import {DataMap} from './datamap';

describe('Unit: lib/datamap', () => {
  describe('DataMap', () => {
    it('get/set', () => {
      const map = new DataMap<Array<string | Array<string>> | {}, string>();
      assert(map.get([]) === void 0);
      map.set([], '');
      assert(map.get([]) === '');
      assert(map.get(['']) === void 0);
      map.set([''], ' ');
      assert(map.get(['']) === ' ');
      assert(map.get([]) === '');
      map.set([], ' ');
      assert(map.get([]) === ' ');

      assert(map.get([[]]) === void 0);
      map.set([[]], '');
      assert(map.get([[]]) === '');
      assert(map.get([['']]) === void 0);
      map.set([['']], ' ');
      assert(map.get([['']]) === ' ');
      assert(map.get([[]]) === '');
      map.set([[]], ' ');
      assert(map.get([[]]) === ' ');

      assert(map.get({}) === void 0);
      map.set({}, '');
      assert(map.get({}) === '');
      assert(map.get({ '': '' }) === void 0);
      map.set({ '': '' }, ' ');
      assert(map.get({ '': '' }) === ' ');
      assert(map.get({}) === '');
      map.set({}, ' ');
      assert(map.get({}) === ' ');
    });

    it('has', () => {
      const map = new DataMap<Array<string | {}>, string>();
      assert(map.has([]) === false);
      map.set([], '');
      assert(map.has([]) === true);
      assert(map.has(['']) === false);
    });

    it('delete', () => {
      const map = new DataMap<Array<string | {}>, string>();
      map.set([], '');
      assert(map.delete([]) === true);
      assert(map.has([]) === false);
      assert(map.delete([]) === false);
      map.set([{}], '');
      assert(map.delete([{}]) === true);
      assert(map.has([{}]) === false);
      assert(map.delete([{}]) === false);
    });

    it('clear', () => {
      const map = new DataMap<string[], string>();
      map.set([], '');
      assert(map.clear() === void 0);
      assert(map.has([]) === false);
    });

    it('size', () => {
      const map = new DataMap<string[], string>();
      assert(map.size === 0);
      assert(map.size === 0);
      map.set([], '');
      assert(map.size === 1);
      map.set([], '');
      assert(map.size === 1);
      map.set([''], '');
      assert(map.size === 2);
      assert(map.delete([]) === true);
      assert(map.delete([]) === false);
      assert(map.size === 1);
      assert(map.clear() === void 0);
      assert(map.size === 0);
    });

  });

});
