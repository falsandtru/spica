import { Heap } from './heap';

describe('Unit: lib/heap', () => {
  describe('Heap', () => {
    function inspect<T>(heap: Heap<T>) {
      return heap['array'];
    }

    it('insert/extract', () => {
      const heap = new Heap<number>();

      assert(heap.extract() === undefined);

      assert(heap.insert(1, 1) === undefined);
      assert.deepStrictEqual(inspect(heap), [
        [1, 1],
      ]);

      assert(heap.insert(2, 2) === undefined);
      assert.deepStrictEqual(inspect(heap), [
        [2, 2],
        [1, 1],
      ]);

      assert(heap.insert(3, 3) === undefined);
      assert.deepStrictEqual(inspect(heap), [
        [3, 3],
        [1, 1],
        [2, 2],
      ]);

      assert(heap.insert(0, 0) === undefined);
      assert.deepStrictEqual(inspect(heap), [
        [3, 3],
        [1, 1],
        [2, 2],
        [0, 0],
      ]);

      assert(heap.insert(11, 11) === undefined);
      assert.deepStrictEqual(inspect(heap), [
        [11, 11],
        [3, 3],
        [2, 2],
        [0, 0],
        [1, 1],
      ]);

      assert(heap.insert(10, 10) === undefined);
      assert.deepStrictEqual(inspect(heap), [
        [11, 11],
        [3, 3],
        [10, 10],
        [0, 0],
        [1, 1],
        [2, 2],
      ]);

      assert(heap.extract() === 11);
      assert(heap.extract() === 10);
      assert(heap.extract() === 3);
      assert(heap.extract() === 2);
      assert(heap.extract() === 1);
      assert(heap.extract() === 0);
    });

    it('replace', () => {
      const heap = new Heap<number>();

      assert(heap.replace(0, 0) === undefined);
      assert(heap.length === 1);
      assert.deepStrictEqual(inspect(heap), [
        [0, 0],
      ]);
      assert(heap.replace(1, 1) === 0);
      assert(heap.length === 1);
      assert.deepStrictEqual(inspect(heap), [
        [1, 1],
      ]);

      assert(heap.insert(2, 2) === undefined);
      assert(heap.insert(3, 3) === undefined);
      assert(heap.insert(4, 4) === undefined);
      assert(heap.insert(5, 5) === undefined);
      assert(heap.insert(6, 6) === undefined);
      assert(heap.insert(7, 7) === undefined);
      assert(heap.length === 7);
      assert.deepStrictEqual(inspect(heap), [
        [7, 7],
        [4, 4],
        [6, 6],
        [1, 1],
        [3, 3],
        [2, 2],
        [5, 5],
      ]);

      assert(heap.replace(0, 0) === 7);
      assert(heap.length === 7);
      assert.deepStrictEqual(inspect(heap), [
        [6, 6],
        [4, 4],
        [5, 5],
        [1, 1],
        [3, 3],
        [2, 2],
        [0, 0],
      ]);
    });

  });

});
