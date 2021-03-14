import { List } from './ixlist';
import { MultiMap } from '../multimap';

describe('Unit: lib/ixlist', () => {
  describe('List', () => {
    function inspect<K, V>(list: List<K, V>) {
      return {
        list: [...list],
        nodes: Object.values(list['nodes']).map(node => node && [node.key, node.value, node.index]),
        head: list.HEAD,
        cursor: list['CURSOR'],
        length: list.length,
      };
    }

    it('put/delete 1', () => {
      const list = new List<number>(new Map(), 1);

      assert.deepStrictEqual(inspect(list), {
        list: [],
        nodes: [],
        head: 0,
        cursor: 0,
        length: 0,
      });

      assert(list.put(0) === 0);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [0, undefined],
        ],
        nodes: [
          [0, undefined, 0],
        ],
        head: 0,
        cursor: 0,
        length: 1,
      });

      assert(list.put(1) === 0);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [1, undefined],
        ],
        nodes: [
          [1, undefined, 0],
        ],
        head: 0,
        cursor: 0,
        length: 1,
      });

      assert(list.put(1) === 0);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [1, undefined],
        ],
        nodes: [
          [1, undefined, 0],
        ],
        head: 0,
        cursor: 0,
        length: 1,
      });

      assert.deepStrictEqual(list.del(0), undefined);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [1, undefined],
        ],
        nodes: [
          [1, undefined, 0],
        ],
        head: 0,
        cursor: 0,
        length: 1,
      });

      assert.deepStrictEqual(list.del(1), { index: 0, key: 1, value: undefined, next: 0, prev: 0 });
      assert.deepStrictEqual(inspect(list), {
        list: [],
        nodes: [
          undefined,
        ],
        head: 0,
        cursor: 0,
        length: 0,
      });

      assert.deepStrictEqual(list.del(1), undefined);
      assert.deepStrictEqual(inspect(list), {
        list: [],
        nodes: [
          undefined,
        ],
        head: 0,
        cursor: 0,
        length: 0,
      });
    });

    it('put/delete 2', () => {
      const list = new List<number>(new Map(), 2);

      assert(list.put(0) === 0);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [0, undefined],
        ],
        nodes: [
          [0, undefined, 0],
        ],
        head: 0,
        cursor: 0,
        length: 1,
      });

      assert(list.put(1) === 1);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [1, undefined],
          [0, undefined],
        ],
        nodes: [
          [0, undefined, 0],
          [1, undefined, 1],
        ],
        head: 1,
        cursor: 1,
        length: 2,
      });

      assert(list.put(1) === 1);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [1, undefined],
          [0, undefined],
        ],
        nodes: [
          [0, undefined, 0],
          [1, undefined, 1],
        ],
        head: 1,
        cursor: 1,
        length: 2,
      });

      assert.deepStrictEqual(list.del(0), { index: 0, key: 0, value: undefined, next: 1, prev: 1 });
      assert.deepStrictEqual(inspect(list), {
        list: [
          [1, undefined],
        ],
        nodes: [
          undefined,
          [1, undefined, 1],
        ],
        head: 1,
        cursor: 1,
        length: 1,
      });

      assert.deepStrictEqual(list.del(1), { index: 1, key: 1, value: undefined, next: 1, prev: 1 });
      assert.deepStrictEqual(inspect(list), {
        list: [],
        nodes: [
          undefined,
          undefined,
        ],
        head: 1,
        cursor: 1,
        length: 0,
      });

      assert.deepStrictEqual(list.del(1), undefined);
      assert.deepStrictEqual(inspect(list), {
        list: [],
        nodes: [
          undefined,
          undefined,
        ],
        head: 1,
        cursor: 1,
        length: 0,
      });
    });

    it('put/delete 3', () => {
      const list = new List<number>(new Map(), 3);

      assert(list.put(0) === 0);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [0, undefined],
        ],
        nodes: [
          [0, undefined, 0],
        ],
        head: 0,
        cursor: 0,
        length: 1,
      });

      assert(list.put(1) === 1);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [1, undefined],
          [0, undefined],
        ],
        nodes: [
          [0, undefined, 0],
          [1, undefined, 1],
        ],
        head: 1,
        cursor: 1,
        length: 2,
      });

      assert(list.put(2) === 2);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [2, undefined],
          [1, undefined],
          [0, undefined],
        ],
        nodes: [
          [0, undefined, 0],
          [1, undefined, 1],
          [2, undefined, 2],
        ],
        head: 2,
        cursor: 2,
        length: 3,
      });

      assert(list.put(3) === 0);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [3, undefined],
          [2, undefined],
          [1, undefined],
        ],
        nodes: [
          [3, undefined, 0],
          [1, undefined, 1],
          [2, undefined, 2],
        ],
        head: 0,
        cursor: 0,
        length: 3,
      });

      assert.deepStrictEqual(list.del(0), undefined);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [3, undefined],
          [2, undefined],
          [1, undefined],
        ],
        nodes: [
          [3, undefined, 0],
          [1, undefined, 1],
          [2, undefined, 2],
        ],
        head: 0,
        cursor: 0,
        length: 3,
      });

      assert.deepStrictEqual(list.del(1), { index: 1, key: 1, value: undefined, next: 0, prev: 2 });
      assert.deepStrictEqual(inspect(list), {
        list: [
          [3, undefined],
          [2, undefined],
        ],
        nodes: [
          [3, undefined, 0],
          undefined,
          [2, undefined, 2],
        ],
        head: 0,
        cursor: 0,
        length: 2,
      });

      assert.deepStrictEqual(list.del(1), undefined);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [3, undefined],
          [2, undefined],
        ],
        nodes: [
          [3, undefined, 0],
          undefined,
          [2, undefined, 2],
        ],
        head: 0,
        cursor: 0,
        length: 2,
      });
    });

    it('insert', () => {
      const list = new List<number, number>(undefined, 2);

      assert(list.insert(0, ~0, 0) === 0);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [0, ~0],
        ],
        nodes: [
          [0, ~0, 0],
        ],
        head: 0,
        cursor: 0,
        length: 1,
      });

      assert(list.insert(1, ~1, 0) === 1);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [0, ~0],
          [1, ~1],
        ],
        nodes: [
          [0, ~0, 0],
          [1, ~1, 1],
        ],
        head: 0,
        cursor: 1,
        length: 2,
      });

      assert(list.insert(2, ~2, 0) === 1);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [0, ~0],
          [2, ~2],
        ],
        nodes: [
          [0, ~0, 0],
          [2, ~2, 1],
        ],
        head: 0,
        cursor: 1,
        length: 2,
      });
    });

    it('update', () => {
      const list = new List<number, number>(new Map(), 3);

      assert(list.put(0, ~0) === 0);
      assert(list.put(1, ~1) === 1);
      assert(list.put(2, ~2) === 2);
      assert(list.put(1, 0) === 1);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [2, ~2],
          [1, 0],
          [0, ~0],
        ],
        nodes: [
          [0, ~0, 0],
          [1, 0, 1],
          [2, ~2, 2],
        ],
        head: 2,
        cursor: 1,
        length: 3,
      });

    });

    it('duplicate', () => {
      const list = new List<number, number>(new MultiMap(), 3);

      list.add(0, 1);
      list.add(0, 2);
      list.add(0, 3);
      list.add(0, 4);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [0, 4],
          [0, 3],
          [0, 2],
        ],
        nodes: [
          [0, 4, 0],
          [0, 2, 1],
          [0, 3, 2],
        ],
        head: 0,
        cursor: 0,
        length: 3,
      });

      list.add(1, 0);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [1, 0],
          [0, 4],
          [0, 3],
        ],
        nodes: [
          [0, 4, 0],
          [1, 0, 1],
          [0, 3, 2],
        ],
        head: 1,
        cursor: 1,
        length: 3,
      });

      assert(list.get(0) === 4);
      assert(list.del(0)?.value === 4);
      assert(list.del(0)?.value === 3);
      assert(list.del(0)?.value === undefined);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [1, 0],
        ],
        nodes: [
          undefined,
          [1, 0, 1],
          undefined,
        ],
        head: 1,
        cursor: 1,
        length: 1,
      });
    });

    it('swap', () => {
      const list = new List<number, number>(undefined, 4);

      list.add(0, ~0);
      list.add(1, ~1);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [1, ~1],
          [0, ~0],
        ],
        nodes: [
          [0, ~0, 0],
          [1, ~1, 1],
        ],
        head: 1,
        cursor: 1,
        length: 2,
      });

      list.swap(0, 1);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [0, ~0],
          [1, ~1],
        ],
        nodes: [
          [0, ~0, 0],
          [1, ~1, 1],
        ],
        head: 0,
        cursor: 1,
        length: 2,
      });

      list.add(2, ~2);
      list.add(3, ~3);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [3, ~3],
          [2, ~2],
          [0, ~0],
          [1, ~1],
        ],
        nodes: [
          [0, ~0, 0],
          [1, ~1, 1],
          [2, ~2, 2],
          [3, ~3, 3],
        ],
        head: 3,
        cursor: 3,
        length: 4,
      });

      list.swap(0, 3);
      assert.deepStrictEqual(inspect(list), {
        list: [
          [0, ~0],
          [2, ~2],
          [3, ~3],
          [1, ~1],
        ],
        nodes: [
          [0, ~0, 0],
          [1, ~1, 1],
          [2, ~2, 2],
          [3, ~3, 3],
        ],
        head: 0,
        cursor: 3,
        length: 4,
      });
    });

  });

});
