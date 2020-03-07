import { MultiMap } from './multimap';

describe('Unit: lib/multimap', () => {
  describe('MultiMap', () => {
    it('has', () => {
      const map = new MultiMap<number, number>([[0, 1], [0, 2], [1, 0]]);
      assert(map.has(0) === true);
      assert(map.has(1) === true);
      assert(map.has(2) === false);
    });

    it('delete', () => {
      const map = new MultiMap<number, number>([[0, 1]]);
      assert(map.has(0) === true);
      assert(map.delete(0) === true);
      assert(map.has(0) === false);
      assert(map.delete(0) === false);
      assert(map.delete(1) === false);
    });

    it('get/set/ref', () => {
      const map = new MultiMap<number, number>();
      assert.deepStrictEqual([...map.ref(0)], []);
      assert(map.get(0) === undefined);
      assert(map.set(0, 1) === map);
      assert(map.get(0) === 1);
      assert.deepStrictEqual([...map.ref(0)], [1]);
      assert(map.set(0, 2) === map);
      assert(map.get(0) === 1);
      assert.deepStrictEqual([...map.ref(0)], [1, 2]);
    });

    it('take', () => {
      const map = new MultiMap<number, number>();
      assert.deepStrictEqual([...map.take(0, 0)], []);
      assert(map.has(0) === false);
      map.set(0, 1);
      assert.deepStrictEqual([...map.take(0, 0)], []);
      assert.deepStrictEqual([...map.take(0, 1)], [1]);
      assert.deepStrictEqual([...map.ref(0)], []);
      map.set(0, 1);
      map.set(0, 2);
      assert.deepStrictEqual([...map.take(0, 1)], [1]);
      assert.deepStrictEqual([...map.ref(0)], [2]);
      map.set(0, 1);
      assert.deepStrictEqual([...map.take(0, Infinity)], [2, 1]);
      assert.deepStrictEqual([...map.ref(0)], []);
    });

  });

});
