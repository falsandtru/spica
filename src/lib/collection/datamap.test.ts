import { DataMap } from './datamap';

describe('Unit: lib/datamap', () => {
  describe('DataMap', () => {
    it('initialize', () => {
      const map = new DataMap<{}, number>(<[{}, number][]>[[{}, 1]]);
      assert(map.get({}) === 1);
    });

    it('get/set', () => {
      const map = new DataMap<Array<string | Array<string>> | {}, string>();
      assert(map.get([]) === undefined);
      assert(map.set([], '') === map);
      assert(map.get([]) === '');
      assert(map.get(['']) === undefined);
      assert(map.set([''], ' ') === map);
      assert(map.get(['']) === ' ');
      assert(map.get([]) === '');
      assert(map.set([], ' ') === map);
      assert(map.get([]) === ' ');

      assert(map.get([[]]) === undefined);
      assert(map.set([[]], '') === map);
      assert(map.get([[]]) === '');
      assert(map.get([['']]) === undefined);
      assert(map.set([['']], ' ') === map);
      assert(map.get([['']]) === ' ');
      assert(map.get([[]]) === '');
      assert(map.set([[]], ' ') === map);
      assert(map.get([[]]) === ' ');

      assert(map.get({}) === undefined);
      assert(map.set({}, '') === map);
      assert(map.get({}) === '');
      assert(map.get({ '': '' }) === undefined);
      assert(map.set({ '': '' }, ' ') === map);
      assert(map.get({ '': '' }) === ' ');
      assert(map.get({}) === '');
      assert(map.set({}, ' ') === map);
      assert(map.get({}) === ' ');
    });

    it('has', () => {
      const map = new DataMap<Array<string | {}>, string>();
      assert(map.has([]) === false);
      assert(map.set([], '') === map);
      assert(map.has([]) === true);
      assert(map.has(['']) === false);
    });

    it('delete', () => {
      const map = new DataMap<Array<string | {}>, string>();
      assert(map.set([], '') === map);
      assert(map.delete([]) === true);
      assert(map.has([]) === false);
      assert(map.delete([]) === false);
      assert(map.set([{}], '') === map);
      assert(map.delete([{}]) === true);
      assert(map.has([{}]) === false);
      assert(map.delete([{}]) === false);
    });

    it('clear', () => {
      const map = new DataMap<string[], string>();
      assert(map.set([], '') === map);
      assert(map.clear() === undefined);
      assert(map.has([]) === false);
    });

    it('size', () => {
      const map = new DataMap<string[], string>();
      assert(map.size === 0);
      assert(map.size === 0);
      assert(map.set([], '') === map);
      assert(map.size === 1);
      assert(map.set([], '') === map);
      assert(map.size === 1);
      assert(map.set([''], '') === map);
      assert(map.size === 2);
      assert(map.delete([]) === true);
      assert(map.delete([]) === false);
      assert(map.size === 1);
      assert(map.clear() === undefined);
      assert(map.size === 0);
    });

    it('plain object', () => {
      const map = new DataMap<object, string>();
      const o1 = Object.create(null);
      const o2 = Object.create(null);
      assert(map.set(o1, '') === map);
      assert(map.has(o1) === true);
      assert(map.has(o2) === false);
      assert(map.has({}) === false);
    });

    it('injection', () => {
      const map = new DataMap<string[], string>();
      assert(map.set(['a', 'b'], '') === map);
      assert(map.has(['a,3:b']) === false);
    });

  });

});
