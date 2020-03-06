import { CList as List } from './clist';

describe('Unit: lib/clist', () => {
  describe('CList', () => {
    it('CList', () => {
      (): List<number> => List(0);
      (): List<number> => List(0).tail;
      assert.deepStrictEqual([...List()], []);
      assert.deepStrictEqual([...List(0)], [0]);
      assert.deepStrictEqual([...List(0, 1)], [0, 1]);
    });

    it('head', () => {
      assert.throws(() => List().head);
      assert(List(0).head === 0);
      assert(List(0, 1).head === 0);
    });

    it('tail', () => {
      assert.throws(() => List().tail);
      assert(List(0).tail);
      assert(List(0, 1).tail.head === 1);
    });

    it('map', () => {
      assert.deepStrictEqual([...List().map(v => v)], []);
      assert.deepStrictEqual([...List(0).map(v => ++v)], [1]);
      assert.deepStrictEqual([...List(0, 1).map(v => ++v)], [1, 2]);
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

  });

});

