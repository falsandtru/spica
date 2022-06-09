import { Heap } from './heap';

describe('Unit: lib/heap', () => {
  describe('Heap', () => {
    function inspect<T>(heap: Heap<T>) {
      return Array.from(heap['array']);
    }

    it('insert/extract', () => {
      const heap = new Heap<number>((a, b) => b - a);

      assert(heap.extract() === undefined);

      assert.deepStrictEqual(heap.insert(1, 1), [1, 1, 0]);
      assert.deepStrictEqual(inspect(heap), [
        [1, 1, 0],
      ]);

      assert.deepStrictEqual(heap.insert(2, 2), [2, 2, 0]);
      assert.deepStrictEqual(inspect(heap), [
        [2, 2, 0],
        [1, 1, 1],
      ]);

      assert.deepStrictEqual(heap.insert(3, 3), [3, 3, 0]);
      assert.deepStrictEqual(inspect(heap), [
        [3, 3, 0],
        [1, 1, 1],
        [2, 2, 2],
      ]);

      assert.deepStrictEqual(heap.insert(0, 0), [0, 0, 3]);
      assert.deepStrictEqual(inspect(heap), [
        [3, 3, 0],
        [1, 1, 1],
        [2, 2, 2],
        [0, 0, 3],
      ]);

      assert.deepStrictEqual(heap.insert(11, 11), [11, 11, 0]);
      assert.deepStrictEqual(inspect(heap), [
        [11, 11, 0],
        [3, 3, 1],
        [2, 2, 2],
        [0, 0, 3],
        [1, 1, 4],
      ]);

      assert.deepStrictEqual(heap.insert(10, 10), [10, 10, 2]);
      assert.deepStrictEqual(inspect(heap), [
        [11, 11, 0],
        [3, 3, 1],
        [10, 10, 2],
        [0, 0, 3],
        [1, 1, 4],
        [2, 2, 5],
      ]);

      assert(heap.extract() === 11);
      assert(heap.extract() === 10);
      assert(heap.extract() === 3);
      assert(heap.extract() === 2);
      assert(heap.extract() === 1);
      assert(heap.extract() === 0);
    });

    it('replace', () => {
      const heap = new Heap<number>((a, b) => b - a);

      assert(heap.replace(0, 0) === undefined);
      assert(heap.length === 1);
      assert.deepStrictEqual(inspect(heap), [
        [0, 0, 0],
      ]);
      assert(heap.replace(1, 1) === 0);
      assert(heap.length === 1);
      assert.deepStrictEqual(inspect(heap), [
        [1, 1, 0],
      ]);

      assert.deepStrictEqual(heap.insert(2, 2), [2, 2, 0]);
      assert.deepStrictEqual(heap.insert(3, 3), [3, 3, 0]);
      assert.deepStrictEqual(heap.insert(4, 4), [4, 4, 0]);
      assert.deepStrictEqual(heap.insert(5, 5), [5, 5, 0]);
      assert.deepStrictEqual(heap.insert(6, 6), [6, 6, 0]);
      assert.deepStrictEqual(heap.insert(7, 7), [7, 7, 0]);
      assert(heap.length === 7);
      assert.deepStrictEqual(inspect(heap), [
        [7, 7, 0],
        [4, 4, 1],
        [6, 6, 2],
        [1, 1, 3],
        [3, 3, 4],
        [2, 2, 5],
        [5, 5, 6],
      ]);

      assert(heap.replace(0, 0) === 7);
      assert(heap.length === 7);
      assert.deepStrictEqual(inspect(heap), [
        [6, 6, 0],
        [4, 4, 1],
        [5, 5, 2],
        [1, 1, 3],
        [3, 3, 4],
        [2, 2, 5],
        [0, 0, 6],
      ]);
    });

    it('stable', () => {
      const heap = new Heap<number>((a, b) => b - a, true);

      assert.deepStrictEqual(heap.insert(1, 1), [1, 1, 0]);
      assert.deepStrictEqual(inspect(heap), [
        [1, 1, 0],
      ]);

      assert.deepStrictEqual(heap.insert(3, 3), [3, 3, 0]);
      assert.deepStrictEqual(inspect(heap), [
        [3, 3, 0],
        [1, 1, 1],
      ]);

      assert.deepStrictEqual(heap.insert(2.1, 2), [2, 2.1, 2]);
      assert.deepStrictEqual(inspect(heap), [
        [3, 3, 0],
        [1, 1, 1],
        [2, 2.1, 2],
      ]);

      assert.deepStrictEqual(heap.insert(2.2, 2), [2, 2.2, 1]);
      assert.deepStrictEqual(inspect(heap), [
        [3, 3, 0],
        [2, 2.2, 1],
        [2, 2.1, 2],
        [1, 1, 3],
      ]);

      assert(heap.extract() === 3);
      assert(heap.extract() === 2.1);
      assert(heap.extract() === 2.2);
      assert(heap.extract() === 1);

      heap.clear();
      const nodes = [
        heap.insert(0, 0),
        heap.insert(1, 0),
        heap.insert(2, 0),
        heap.insert(3, 0),
        heap.insert(4, 0),
        heap.insert(5, 0),
        heap.insert(6, 0),
      ];
      assert.deepStrictEqual(inspect(heap), [
        [0, 0, 0],
        [0, 1, 1],
        [0, 2, 2],
        [0, 3, 3],
        [0, 4, 4],
        [0, 5, 5],
        [0, 6, 6],
      ]);
      heap.update(nodes[1], 0);
      assert.deepStrictEqual(inspect(heap), [
        [0, 0, 0],
        [0, 1, 1],
        [0, 2, 2],
        [0, 3, 3],
        [0, 4, 4],
        [0, 5, 5],
        [0, 6, 6],
      ]);
    });

  });

});
