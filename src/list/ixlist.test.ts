import { List } from './ixlist';

describe('Unit: lib/ixlist', () => {
  describe('List', () => {
    function inspect<T>(list: List<T>) {
      return {
        list: [...list],
        head: list.head,
        length: list.length,
      };
    }

    it('add/delete 1', () => {
      const list = new List<number>(1);

      assert.deepStrictEqual(inspect(list), {
        list: [],
        head: 0,
        length: 0,
      });

      assert(list.add(0) === 0);
      assert.deepStrictEqual(inspect(list), {
        list: [
          0,
        ],
        head: 0,
        length: 1,
      });

      assert(list.add(1) === 0);
      assert.deepStrictEqual(inspect(list), {
        list: [
          1,
        ],
        head: 0,
        length: 1,
      });

      assert(list.add(1) === 0);
      assert.deepStrictEqual(inspect(list), {
        list: [
          1,
        ],
        head: 0,
        length: 1,
      });

      list.del(0);
      assert.deepStrictEqual(inspect(list), {
        list: [],
        head: 0,
        length: 0,
      });
    });

    it('add/delete 2', () => {
      const list = new List<number>(2);

      assert(list.add(0) === 0);
      assert.deepStrictEqual(inspect(list), {
        list: [
          0,
        ],
        head: 0,
        length: 1,
      });

      assert(list.add(1) === 1);
      assert.deepStrictEqual(inspect(list), {
        list: [
          1,
          0,
        ],
        head: 1,
        length: 2,
      });

      assert(list.add(1) === 0);
      assert.deepStrictEqual(inspect(list), {
        list: [
          1,
          1,
        ],
        head: 0,
        length: 2,
      });

      list.del(0);
      assert.deepStrictEqual(inspect(list), {
        list: [
          1,
        ],
        head: 1,
        length: 1,
      });

      list.del(1);
      assert.deepStrictEqual(inspect(list), {
        list: [],
        head: 1,
        length: 0,
      });
    });

    it('add/delete 3', () => {
      const list = new List<number>(3);

      assert(list.add(0) === 0);
      assert.deepStrictEqual(inspect(list), {
        list: [
          0,
        ],
        head: 0,
        length: 1,
      });

      assert(list.add(1) === 1);
      assert.deepStrictEqual(inspect(list), {
        list: [
          1,
          0,
        ],
        head: 1,
        length: 2,
      });

      assert(list.add(2) === 2);
      assert.deepStrictEqual(inspect(list), {
        list: [
          2,
          1,
          0,
        ],
        head: 2,
        length: 3,
      });

      assert(list.add(3) === 0);
      assert.deepStrictEqual(inspect(list), {
        list: [
          3,
          2,
          1,
        ],
        head: 0,
        length: 3,
      });

      list.del(1);
      assert.deepStrictEqual(inspect(list), {
        list: [
          3,
          2,
        ],
        head: 0,
        length: 2,
      });
    });

    it('insert', () => {
      const list = new List<number>(2);

      assert(list.insert(0, 0) === 0);
      assert.deepStrictEqual(inspect(list), {
        list: [
          0,
        ],
        head: 0,
        length: 1,
      });

      assert(list.insert(1, 0) === 1);
      assert.deepStrictEqual(inspect(list), {
        list: [
          0,
          1,
        ],
        head: 0,
        length: 2,
      });

      assert(list.insert(2, 0) === 1);
      assert.deepStrictEqual(inspect(list), {
        list: [
          0,
          2,
        ],
        head: 0,
        length: 2,
      });
    });

    it('swap', () => {
      const list = new List<number>(4);

      list.add(0);
      list.add(1);
      assert.deepStrictEqual(inspect(list), {
        list: [
          1,
          0,
        ],
        head: 1,
        length: 2,
      });

      list.swap(0, 1);
      assert.deepStrictEqual(inspect(list), {
        list: [
          0,
          1,
        ],
        head: 0,
        length: 2,
      });

      list.add(2);
      list.add(3);
      assert.deepStrictEqual(inspect(list), {
        list: [
          3,
          2,
          0,
          1,
        ],
        head: 3,
        length: 4,
      });

      list.swap(0, 3);
      assert.deepStrictEqual(inspect(list), {
        list: [
          0,
          2,
          3,
          1,
        ],
        head: 0,
        length: 4,
      });
    });

  });

});
