import { List, MList } from './list';

describe('Unit: lib/list', () => {
  describe('List', () => {
    it('List', () => {
      (): List<number> => List(0);
      (): List<number> => List(0).tail;
      assert.deepStrictEqual([...List()], []);
      assert.deepStrictEqual([...List(0)], [0]);
      assert.deepStrictEqual([...List(0, 1)], [0, 1]);
    });

    it('head', () => {
      assert(List().head === undefined);
      assert(List(0).head === 0);
      assert(List(0, 1).head === 0);
    });

    it('tail', () => {
      assert(List().tail === undefined);
      assert(List(0).tail);
      assert(List(0, 1).tail.head === 1);
    });

    it('reverse', () => {
      assert.deepStrictEqual([...List().reverse()], []);
      assert.deepStrictEqual([...List(0).reverse()], [0]);
      assert.deepStrictEqual([...List(0, 1).reverse()], [1, 0]);
    });

    it('length', () => {
      assert(List().length === 0);
      assert(List(0).length === 1);
    });

    it('iterator', () => {
      assert.deepStrictEqual([...List(0).tail], []);
      assert.deepStrictEqual([...List(0)], [0]);
      assert.deepStrictEqual([...List(0, 1)], [0, 1]);
    });

    it('take', () => {
      assert.deepStrictEqual([...MList().take(0)], []);
      assert.deepStrictEqual([...MList().take(1)], []);
      assert.deepStrictEqual([...MList(0).take(0)], []);
      assert.deepStrictEqual([...MList(0).take(1)], [0]);
      assert.deepStrictEqual([...MList(0, 1).take(0)], []);
      assert.deepStrictEqual([...MList(0, 1).take(Infinity)], [0, 1]);
      const list = MList(0, 1);
      assert.deepStrictEqual([...list.take(0)], []);
      assert.deepStrictEqual([...list], [0, 1]);
      assert.deepStrictEqual([...list.take(1)], [0]);
      assert.deepStrictEqual([...list], [1]);
      assert.deepStrictEqual([...list.take(Infinity)], [1]);
      assert.deepStrictEqual([...list], []);
    });

    it('splice', () => {
      let list = MList();
      assert.deepStrictEqual([...list.splice(0)], []);
      assert.deepStrictEqual([...list.splice(0, Infinity)], []);
      assert.deepStrictEqual([...list], []);
      list = MList(0, 1);
      assert.deepStrictEqual([...list.splice(0)], []);
      assert.deepStrictEqual([...list], [0, 1]);
      assert.deepStrictEqual([...list.splice(0, Infinity)], [0, 1]);
      assert.deepStrictEqual([...list], []);
      list = MList(0, 1);
      assert.deepStrictEqual([...list.splice(1)], []);
      assert.deepStrictEqual([...list], [0, 1]);
      assert.deepStrictEqual([...list.splice(1, Infinity)], [1]);
      assert.deepStrictEqual([...list], [0]);
      list = MList(0, 1);
      assert.deepStrictEqual([...list.splice(Infinity)], []);
      assert.deepStrictEqual([...list], [0, 1]);
      assert.deepStrictEqual([...list.splice(Infinity, Infinity)], []);
      assert.deepStrictEqual([...list], [0, 1]);
      list = MList();
      assert.deepStrictEqual([...list.splice(0, Infinity, MList())], []);
      assert.deepStrictEqual([...list], []);
      assert.deepStrictEqual([...list.splice(0, Infinity, MList(0))], []);
      assert.deepStrictEqual([...list], [0]);
      list = MList();
      assert.deepStrictEqual([...list.splice(Infinity, Infinity, MList())], []);
      assert.deepStrictEqual([...list], []);
      assert.deepStrictEqual([...list.splice(Infinity, Infinity, MList(0))], []);
      assert.deepStrictEqual([...list], [0]);
      list = MList();
      assert.deepStrictEqual([...list.splice(0, Infinity, MList(0, 1))], []);
      assert.deepStrictEqual([...list], [0, 1]);
      list = MList();
      assert.deepStrictEqual([...list.splice(Infinity, Infinity, MList(0, 1))], []);
      assert.deepStrictEqual([...list], [0, 1]);
      list = MList(0);
      assert.deepStrictEqual([...list.splice(0, 0, MList())], []);
      assert.deepStrictEqual([...list], [0]);
      assert.deepStrictEqual([...list.splice(0, 0, MList(1))], []);
      assert.deepStrictEqual([...list], [1, 0]);
      assert.deepStrictEqual([...list.splice(0, 0, MList(2, 3))], []);
      assert.deepStrictEqual([...list], [2, 3, 1, 0]);
      list = MList(0);
      assert.deepStrictEqual([...list.splice(Infinity, 0, MList())], []);
      assert.deepStrictEqual([...list], [0]);
      assert.deepStrictEqual([...list.splice(Infinity, 0, MList(1))], []);
      assert.deepStrictEqual([...list], [0, 1]);
      assert.deepStrictEqual([...list.splice(Infinity, 0, MList(2, 3))], []);
      assert.deepStrictEqual([...list], [0, 1, 2, 3]);
      list = MList(0, 1);
      assert.deepStrictEqual([...list.splice(1, 0, MList())], []);
      assert.deepStrictEqual([...list], [0, 1]);
      assert.deepStrictEqual([...list.splice(1, 0, MList(2))], []);
      assert.deepStrictEqual([...list], [0, 2, 1]);
      assert.deepStrictEqual([...list.splice(1, 0, MList(3, 4))], []);
      assert.deepStrictEqual([...list], [0, 3, 4, 2, 1]);
      list = MList(0, 1, 2, 3);
      assert.deepStrictEqual([...list.splice(1, 1, MList())], [1]);
      assert.deepStrictEqual([...list], [0, 2, 3]);
      assert.deepStrictEqual([...list.splice(1, 1, MList(4))], [2]);
      assert.deepStrictEqual([...list], [0, 4, 3]);
      assert.deepStrictEqual([...list.splice(1, 1, MList(5, 6))], [4]);
      assert.deepStrictEqual([...list], [0, 5, 6, 3]);
      assert.deepStrictEqual([...list.splice(1, 2, MList(7))], [5, 6]);
      assert.deepStrictEqual([...list], [0, 7, 3]);
    });

    it('interleave', () => {
      let list = MList();
      list = MList();
      assert.deepStrictEqual([...list.interleave((_, i) => i === 0, 0, MList(0)) || [null]], [null]);
      assert.deepStrictEqual([...list], []);
      list = MList();
      assert.deepStrictEqual([...list.interleave((_, i) => i === -1, 0, MList(0)) || [null]], []);
      assert.deepStrictEqual([...list], [0]);
      list = MList();
      assert.deepStrictEqual([...list.interleave((_, i) => i === 0, Infinity, MList(0)) || [null]], [null]);
      assert.deepStrictEqual([...list], []);
      list = MList();
      assert.deepStrictEqual([...list.interleave((_, i) => i === -1, Infinity, MList(0)) || [null]], []);
      assert.deepStrictEqual([...list], [0]);
      list = MList(0);
      assert.deepStrictEqual([...list.interleave((_, i) => i === 0, 0, MList(1)) || [null]], []);
      assert.deepStrictEqual([...list], [1, 0]);
      list = MList(0);
      assert.deepStrictEqual([...list.interleave((_, i) => i === -1, 0, MList(1)) || [null]], []);
      assert.deepStrictEqual([...list], [0, 1]);
      list = MList(0);
      assert.deepStrictEqual([...list.interleave((_, i) => i === 0, Infinity, MList(1)) || [null]], [0]);
      assert.deepStrictEqual([...list], [1]);
      list = MList(0);
      assert.deepStrictEqual([...list.interleave((_, i) => i === -1, Infinity, MList(1)) || [null]], []);
      assert.deepStrictEqual([...list], [0, 1]);
    });

    it('convert', () => {
      const list = MList(0, 1);
      assert.deepStrictEqual([...list.convert(v => ++v)], [1, 2]);
      assert.deepStrictEqual([...list], [1, 2]);
      assert(list === list.convert(v => v));
    });

  });

});
