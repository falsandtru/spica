import { WList } from './wlist';

describe('Unit: lib/wlist', () => {
  describe('WList', () => {
    function inspect<K, V>(list: WList<K, V>) {
      return {
        nodes: [...list],
        array: list['nodes'].map(node => node && [node.key, node.value, node.index]),
        head: list['head'],
        cursor: list['cursor'],
        length: list.length,
      };
    }

    it('put/delete 1', () => {
      const list = new WList<number, undefined>(1);

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
          [0, undefined, 0],
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
          [1, undefined, 0],
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
          [1, undefined, 0],
        ],
        array: [
          [1, undefined, 0],
        ],
        head: 0,
        cursor: 0,
        length: 1,
      });

      assert.deepStrictEqual(list.delete(0), undefined);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [1, undefined, 0],
        ],
        array: [
          [1, undefined, 0],
        ],
        head: 0,
        cursor: 0,
        length: 1,
      });

      assert.deepStrictEqual(list.delete(1), { key: 1, value: undefined, size: 1 });
      assert.deepStrictEqual(inspect(list), {
        nodes: [],
        array: [
          undefined,
        ],
        head: 0,
        cursor: 0,
        length: 0,
      });

      assert.deepStrictEqual(list.delete(1), undefined);
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
      const list = new WList<number, undefined>(2);

      assert(list.put(0) === 0);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [0, undefined, 0],
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
          [1, undefined, 1],
          [0, undefined, 0],
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
          [1, undefined, 1],
          [0, undefined, 0],
        ],
        array: [
          [0, undefined, 0],
          [1, undefined, 1],
        ],
        head: 1,
        cursor: 1,
        length: 2,
      });

      assert.deepStrictEqual(list.delete(0), { key: 0, value: undefined, size: 1 });
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [1, undefined, 1],
        ],
        array: [
          undefined,
          [1, undefined, 1],
        ],
        head: 1,
        cursor: 1,
        length: 1,
      });

      assert.deepStrictEqual(list.delete(1), { key: 1, value: undefined, size: 1 });
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

      assert.deepStrictEqual(list.delete(1), undefined);
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
      const list = new WList<number, undefined>(3);

      assert(list.put(0) === 0);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [0, undefined, 0],
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
          [1, undefined, 1],
          [0, undefined, 0],
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
          [2, undefined, 2],
          [1, undefined, 1],
          [0, undefined, 0],
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
          [3, undefined, 0],
          [2, undefined, 2],
          [1, undefined, 1],
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

      assert.deepStrictEqual(list.delete(0), undefined);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [3, undefined, 0],
          [2, undefined, 2],
          [1, undefined, 1],
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

      assert.deepStrictEqual(list.delete(1), { key: 1, value: undefined, size: 1 });
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [3, undefined, 0],
          [2, undefined, 2],
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

      assert.deepStrictEqual(list.delete(1), undefined);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [3, undefined, 0],
          [2, undefined, 2],
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
      const list = new WList<number, number>(3);

      assert(list.put(0, ~0) === 0);
      assert(list.put(1, ~1) === 1);
      assert(list.put(2, ~2) === 2);
      assert(list.put(1, 0) === 1);
      assert.deepStrictEqual(inspect(list), {
        nodes: [
          [2, ~2, 2],
          [1, 0, 1],
          [0, ~0, 0],
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

  });

});
