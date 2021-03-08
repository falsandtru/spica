import { IxList } from './ixlist';
import { MultiMap } from '../multimap';

describe('Unit: lib/ixlist', () => {
  describe('IxList', () => {
    function inspect<K, V>(list: IxList<K, V>) {
      return {
        nodes: [...list],
        array: list['nodes'].map(node => node && [node.key, node.value, node.index]),
        head: list.HEAD,
        cursor: list['cursor'],
        length: list.length,
      };
    }

    it('put/delete 1', () => {
      const list = new IxList<number, undefined>(1, new Map());

      assert.deepStrictEqual(inspect(list), {
        nodes: [],
        array: [],
        head: 0,
        cursor: 0,
        length: 0,
      });

      assert(list.put(0) === 0);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [0, undefined],
        ],
        array: [
          [0, undefined, 0],
        ],
        head: 0,
        cursor: 0,
        length: 1,
      });

      assert(list.put(1) === 0);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [1, undefined],
        ],
        array: [
          [1, undefined, 0],
        ],
        head: 0,
        cursor: 0,
        length: 1,
      });

      assert(list.put(1) === 0);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [1, undefined],
        ],
        array: [
          [1, undefined, 0],
        ],
        head: 0,
        cursor: 0,
        length: 1,
      });

      assert.deepStrictEqual(list.del(0), undefined);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [1, undefined],
        ],
        array: [
          [1, undefined, 0],
        ],
        head: 0,
        cursor: 0,
        length: 1,
      });

      assert.deepStrictEqual(list.del(1), { index: 0, key: 1, value: undefined, next: 0, prev: 0 });
      assert.deepStrictEqual(inspect(list), {
        nodes: [],
        array: [
          undefined,
        ],
        head: 0,
        cursor: 0,
        length: 0,
      });

      assert.deepStrictEqual(list.del(1), undefined);
      assert.deepStrictEqual(inspect(list), {
        nodes: [],
        array: [
          undefined,
        ],
        head: 0,
        cursor: 0,
        length: 0,
      });
    });

    it('put/delete 2', () => {
      const list = new IxList<number, undefined>(2, new Map());

      assert(list.put(0) === 0);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [0, undefined],
        ],
        array: [
          [0, undefined, 0],
        ],
        head: 0,
        cursor: 0,
        length: 1,
      });

      assert(list.put(1) === 1);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [1, undefined],
          [0, undefined],
        ],
        array: [
          [0, undefined, 0],
          [1, undefined, 1],
        ],
        head: 1,
        cursor: 1,
        length: 2,
      });

      assert(list.put(1) === 1);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [1, undefined],
          [0, undefined],
        ],
        array: [
          [0, undefined, 0],
          [1, undefined, 1],
        ],
        head: 1,
        cursor: 1,
        length: 2,
      });

      assert.deepStrictEqual(list.del(0), { index: 0, key: 0, value: undefined, next: 1, prev: 1 });
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [1, undefined],
        ],
        array: [
          undefined,
          [1, undefined, 1],
        ],
        head: 1,
        cursor: 1,
        length: 1,
      });

      assert.deepStrictEqual(list.del(1), { index: 1, key: 1, value: undefined, next: 1, prev: 1 });
      assert.deepStrictEqual(inspect(list), {
        nodes: [],
        array: [
          undefined,
          undefined,
        ],
        head: 1,
        cursor: 1,
        length: 0,
      });

      assert.deepStrictEqual(list.del(1), undefined);
      assert.deepStrictEqual(inspect(list), {
        nodes: [],
        array: [
          undefined,
          undefined,
        ],
        head: 1,
        cursor: 1,
        length: 0,
      });
    });

    it('put/delete 3', () => {
      const list = new IxList<number, undefined>(3, new Map());

      assert(list.put(0) === 0);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [0, undefined],
        ],
        array: [
          [0, undefined, 0],
        ],
        head: 0,
        cursor: 0,
        length: 1,
      });

      assert(list.put(1) === 1);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [1, undefined],
          [0, undefined],
        ],
        array: [
          [0, undefined, 0],
          [1, undefined, 1],
        ],
        head: 1,
        cursor: 1,
        length: 2,
      });

      assert(list.put(2) === 2);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [2, undefined],
          [1, undefined],
          [0, undefined],
        ],
        array: [
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
        nodes: [
          [3, undefined],
          [2, undefined],
          [1, undefined],
        ],
        array: [
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
        nodes: [
          [3, undefined],
          [2, undefined],
          [1, undefined],
        ],
        array: [
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
        nodes: [
          [3, undefined],
          [2, undefined],
        ],
        array: [
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
        nodes: [
          [3, undefined],
          [2, undefined],
        ],
        array: [
          [3, undefined, 0],
          undefined,
          [2, undefined, 2],
        ],
        head: 0,
        cursor: 0,
        length: 2,
      });
    });

    it('update', () => {
      const list = new IxList<number, number>(3, new Map());

      assert(list.put(0, ~0) === 0);
      assert(list.put(1, ~1) === 1);
      assert(list.put(2, ~2) === 2);
      assert(list.put(1, 0) === 1);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [2, ~2],
          [1, 0],
          [0, ~0],
        ],
        array: [
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
      const list = new IxList<number, number>(3, new MultiMap());

      list.add(0, 1);
      list.add(0, 2);
      list.add(0, 3);
      list.add(0, 4);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [0, 4],
          [0, 3],
          [0, 2],
        ],
        array: [
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
        nodes: [
          [1, 0],
          [0, 4],
          [0, 3],
        ],
        array: [
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
        nodes: [
          [1, 0],
        ],
        array: [
          undefined,
          [1, 0, 1],
          undefined,
        ],
        head: 1,
        cursor: 1,
        length: 1,
      });

    });

  });

});
