import { Heap } from './heap';

describe('Unit: lib/heap', () => {
  describe('Heap', () => {
    function inspect<T>(heap: Heap<T>) {
      return Array.from(heap['array']);
    }

    it('insert/extract', () => {
      const heap = new Heap<number>();

      assert(heap.extract() === undefined);

      assert.deepStrictEqual(heap.insert(1, 1), [1, 1, 1]);
      assert.deepStrictEqual(inspect(heap), [
        [1, 1, 1],
      ]);

      assert.deepStrictEqual(heap.insert(2, 2), [2, 2, 1]);
      assert.deepStrictEqual(inspect(heap), [
        [2, 2, 1],
        [1, 1, 2],
      ]);

      assert.deepStrictEqual(heap.insert(3, 3), [3, 3, 1]);
      assert.deepStrictEqual(inspect(heap), [
        [3, 3, 1],
        [1, 1, 2],
        [2, 2, 3],
      ]);

      assert.deepStrictEqual(heap.insert(0, 0), [0, 0, 4]);
      assert.deepStrictEqual(inspect(heap), [
        [3, 3, 1],
        [1, 1, 2],
        [2, 2, 3],
        [0, 0, 4],
      ]);

      assert.deepStrictEqual(heap.insert(11, 11), [11, 11, 1]);
      assert.deepStrictEqual(inspect(heap), [
        [11, 11, 1],
        [3, 3, 2],
        [2, 2, 3],
        [0, 0, 4],
        [1, 1, 5],
      ]);

      assert.deepStrictEqual(heap.insert(10, 10), [10, 10, 3]);
      assert.deepStrictEqual(inspect(heap), [
        [11, 11, 1],
        [3, 3, 2],
        [10, 10, 3],
        [0, 0, 4],
        [1, 1, 5],
        [2, 2, 6],
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
        [0, 0, 1],
      ]);
      assert(heap.replace(1, 1) === 0);
      assert(heap.length === 1);
      assert.deepStrictEqual(inspect(heap), [
        [1, 1, 1],
      ]);

      assert.deepStrictEqual(heap.insert(2, 2), [2, 2, 1]);
      assert.deepStrictEqual(heap.insert(3, 3), [3, 3, 1]);
      assert.deepStrictEqual(heap.insert(4, 4), [4, 4, 1]);
      assert.deepStrictEqual(heap.insert(5, 5), [5, 5, 1]);
      assert.deepStrictEqual(heap.insert(6, 6), [6, 6, 1]);
      assert.deepStrictEqual(heap.insert(7, 7), [7, 7, 1]);
      assert(heap.length === 7);
      assert.deepStrictEqual(inspect(heap), [
        [7, 7, 1],
        [4, 4, 2],
        [6, 6, 3],
        [1, 1, 4],
        [3, 3, 5],
        [2, 2, 6],
        [5, 5, 7],
      ]);

      assert(heap.replace(0, 0) === 7);
      assert(heap.length === 7);
      assert.deepStrictEqual(inspect(heap), [
        [6, 6, 1],
        [4, 4, 2],
        [5, 5, 3],
        [1, 1, 4],
        [3, 3, 5],
        [2, 2, 6],
        [0, 0, 7],
      ]);
    });

    it('delete', () => {
      const heap = new Heap<number>();

      assert(heap.extract() === undefined);

      const node = heap.insert(1, 1);
      heap.insert(2, 2);
      heap.insert(3, 3);
      assert.deepStrictEqual(inspect(heap), [
        [3, 3, 1],
        [1, 1, 2],
        [2, 2, 3],
      ]);

      assert.deepStrictEqual(heap.delete(node), 1);
      assert.deepStrictEqual(inspect(heap), [
        [3, 3, 1],
        [2, 2, 2],
        undefined,
      ]);
    });

    it('stable', () => {
      const heap = new Heap<number>(undefined, { stable: true });

      heap.insert(1, 1);
      assert.deepStrictEqual(inspect(heap), [
        [1, 1, 1],
      ]);

      heap.insert(3, 3);
      assert.deepStrictEqual(inspect(heap), [
        [3, 3, 1],
        [1, 1, 2],
      ]);

      heap.insert(2.1, 2);
      assert.deepStrictEqual(inspect(heap), [
        [3, 3, 1],
        [1, 1, 2],
        [2, 2.1, 3],
      ]);

      heap.insert(2.2, 2);
      assert.deepStrictEqual(inspect(heap), [
        [3, 3, 1],
        [2, 2.2, 2],
        [2, 2.1, 3],
        [1, 1, 4],
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
        [0, 0, 1],
        [0, 1, 2],
        [0, 2, 3],
        [0, 3, 4],
        [0, 4, 5],
        [0, 5, 6],
        [0, 6, 7],
      ]);
      heap.update(nodes[1], 0);
      assert.deepStrictEqual(inspect(heap), [
        [0, 0, 1],
        [0, 1, 2],
        [0, 2, 3],
        [0, 3, 4],
        [0, 4, 5],
        [0, 5, 6],
        [0, 6, 7],
      ]);
    });

  });

});
