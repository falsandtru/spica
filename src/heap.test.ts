import { Heap } from './heap';

describe('Unit: lib/heap', () => {
  describe('Heap', () => {
    function inspect<T>(heap: Heap<T>) {
      return heap['array'];
    }

    it('add/take', () => {
      const heap = new Heap<number>();
      assert(heap.add(1, 1) === 1);
      assert.deepStrictEqual(inspect(heap), [
        [1, 1],
      ]);
      assert(heap.add(2, 2) === 2);
      assert.deepStrictEqual(inspect(heap), [
        [2, 2],
        [1, 1],
      ]);
      assert(heap.add(3, 3) === 3);
      assert.deepStrictEqual(inspect(heap), [
        [3, 3],
        [1, 1],
        [2, 2],
      ]);
      assert(heap.add(0, 0) === 4);
      assert.deepStrictEqual(inspect(heap), [
        [3, 3],
        [1, 1],
        [2, 2],
        [0, 0],
      ]);
      assert(heap.add(11, 11) === 5);
      assert.deepStrictEqual(inspect(heap), [
        [11, 11],
        [3, 3],
        [2, 2],
        [0, 0],
        [1, 1],
      ]);
      assert(heap.add(10, 10) === 6);
      assert.deepStrictEqual(inspect(heap), [
        [11, 11],
        [3, 3],
        [10, 10],
        [0, 0],
        [1, 1],
        [2, 2],
      ]);
      assert(heap.take() === 11);
      assert(heap.take() === 10);
      assert(heap.take() === 3);
      assert(heap.take() === 2);
      assert(heap.take() === 1);
      assert(heap.take() === 0);
    });

  });

});
