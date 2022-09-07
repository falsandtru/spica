import { Heap } from './heap.uint';

describe('Unit: lib/heap.uint', () => {
  describe('Heap uint', () => {
    function inspect<T>(heap: Heap<T>) {
      return Object.fromEntries(Object.entries(heap['dict']).map(([k, v]) => [k, [...v]]));
    }

    it('stable', () => {
      const heap = new Heap<number>();

      assert.deepStrictEqual(heap.insert(1, 1)[0], 1);
      assert.deepStrictEqual(inspect(heap), {
        1: [1],
      });

      assert.deepStrictEqual(heap.insert(3, 3)[0], 3);
      assert.deepStrictEqual(inspect(heap), {
        1: [1],
        3: [3],
      });

      assert.deepStrictEqual(heap.insert(2.1, 2)[0], 2);
      assert.deepStrictEqual(inspect(heap), {
        1: [1],
        2: [2.1],
        3: [3],
      });

      assert.deepStrictEqual(heap.insert(2.2, 2)[0], 2);
      assert.deepStrictEqual(inspect(heap), {
        1: [1],
        2: [2.1, 2.2],
        3: [3],
      });

      assert(heap.extract() === 1);
      assert(heap.extract() === 2.1);
      assert(heap.extract() === 2.2);
      assert(heap.extract() === 3);
    });

  });

});
