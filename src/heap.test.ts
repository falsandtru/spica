import { Heap } from './heap';
import { pcg32 } from './random';

describe('Unit: lib/heap', () => {
  describe('Heap', () => {
    function inspect<T>(heap: Heap<T>) {
      return Array.from(heap['array']);
    }

    it('insert/extract', () => {
      const heap = new Heap<number>();

      assert(heap.extract() === undefined);

      assert.deepStrictEqual(heap.insert(1, 1), { index: 1, order: 1, value: 1 });
      assert.deepStrictEqual(inspect(heap), [
        { index: 1, order: 1, value: 1 },
      ]);

      assert.deepStrictEqual(heap.insert(2, 2), { index: 1, order: 2, value: 2 });
      assert.deepStrictEqual(inspect(heap), [
        { index: 1, order: 2, value: 2 },
        { index: 2, order: 1, value: 1 },
      ]);

      assert.deepStrictEqual(heap.insert(3, 3), { index: 1, order: 3, value: 3 });
      assert.deepStrictEqual(inspect(heap), [
        { index: 1, order: 3, value: 3 },
        { index: 2, order: 1, value: 1 },
        { index: 3, order: 2, value: 2 },
      ]);

      assert.deepStrictEqual(heap.insert(0, 0), { index: 4, order: 0, value: 0 });
      assert.deepStrictEqual(inspect(heap), [
        { index: 1, order: 3, value: 3 },
        { index: 2, order: 1, value: 1 },
        { index: 3, order: 2, value: 2 },
        { index: 4, order: 0, value: 0 },
      ]);

      assert.deepStrictEqual(heap.insert(11, 11), { index: 1, order: 11, value: 11 });
      assert.deepStrictEqual(inspect(heap), [
        { index: 1, order: 11, value: 11 },
        { index: 2, order: 3, value: 3 },
        { index: 3, order: 2, value: 2 },
        { index: 4, order: 0, value: 0 },
        { index: 5, order: 1, value: 1 },
      ]);

      assert.deepStrictEqual(heap.insert(10, 10), { index: 3, order: 10, value: 10 });
      assert.deepStrictEqual(inspect(heap), [
        { index: 1, order: 11, value: 11 },
        { index: 2, order: 3, value: 3 },
        { index: 3, order: 10, value: 10 },
        { index: 4, order: 0, value: 0 },
        { index: 5, order: 1, value: 1 },
        { index: 6, order: 2, value: 2 },
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
        { index: 1, order: 0, value: 0 },
      ]);
      assert(heap.replace(1, 1) === 0);
      assert(heap.length === 1);
      assert.deepStrictEqual(inspect(heap), [
        { index: 1, order: 1, value: 1 },
      ]);

      assert.deepStrictEqual(heap.insert(2, 2), { index: 1, order: 2, value: 2 });
      assert.deepStrictEqual(heap.insert(3, 3), { index: 1, order: 3, value: 3 });
      assert.deepStrictEqual(heap.insert(4, 4), { index: 1, order: 4, value: 4 });
      assert.deepStrictEqual(heap.insert(5, 5), { index: 1, order: 5, value: 5 });
      assert.deepStrictEqual(heap.insert(6, 6), { index: 1, order: 6, value: 6 });
      assert.deepStrictEqual(heap.insert(7, 7), { index: 1, order: 7, value: 7 });
      assert(heap.length === 7);
      assert.deepStrictEqual(inspect(heap), [
        { index: 1, order: 7, value: 7 },
        { index: 2, order: 4, value: 4 },
        { index: 3, order: 6, value: 6 },
        { index: 4, order: 1, value: 1 },
        { index: 5, order: 3, value: 3 },
        { index: 6, order: 2, value: 2 },
        { index: 7, order: 5, value: 5 },
      ]);

      assert(heap.replace(0, 0) === 7);
      assert(heap.length === 7);
      assert.deepStrictEqual(inspect(heap), [
        { index: 1, order: 6, value: 6 },
        { index: 2, order: 4, value: 4 },
        { index: 3, order: 5, value: 5 },
        { index: 4, order: 1, value: 1 },
        { index: 5, order: 3, value: 3 },
        { index: 6, order: 2, value: 2 },
        { index: 7, order: 0, value: 0 },
      ]);
    });

    it('delete', () => {
      const heap = new Heap<number>();

      assert(heap.extract() === undefined);

      const nodes = [
        heap.insert(1, 1),
        heap.insert(2, 2),
        heap.insert(3, 3),
        heap.insert(4, 4),
      ];
      assert.deepStrictEqual(inspect(heap), [
        { index: 1, order: 4, value: 4 },
        { index: 2, order: 3, value: 3 },
        { index: 3, order: 2, value: 2 },
        { index: 4, order: 1, value: 1 },
      ]);

      assert.deepStrictEqual(heap.delete(nodes[0]), 1);
      assert.deepStrictEqual(inspect(heap), [
        { index: 1, order: 4, value: 4 },
        { index: 2, order: 3, value: 3 },
        { index: 3, order: 2, value: 2 },
        undefined,
      ]);

      assert.deepStrictEqual(heap.delete(nodes[2]), 3);
      assert.deepStrictEqual(inspect(heap), [
        { index: 1, order: 4, value: 4 },
        { index: 2, order: 2, value: 2 },
        undefined,
        undefined,
      ]);
    });

    it('stable', () => {
      const heap = new Heap<number>(undefined, { stable: true });

      heap.insert(1, 1);
      assert.deepStrictEqual(inspect(heap), [
        { index: 1, order: 1, value: 1 },
      ]);

      heap.insert(3, 3);
      assert.deepStrictEqual(inspect(heap), [
        { index: 1, order: 3, value: 3 },
        { index: 2, order: 1, value: 1 },
      ]);

      heap.insert(2.1, 2);
      assert.deepStrictEqual(inspect(heap), [
        { index: 1, order: 3, value: 3 },
        { index: 2, order: 1, value: 1 },
        { index: 3, order: 2, value: 2.1 },
      ]);

      heap.insert(2.2, 2);
      assert.deepStrictEqual(inspect(heap), [
        { index: 1, order: 3, value: 3 },
        { index: 2, order: 2, value: 2.2 },
        { index: 3, order: 2, value: 2.1 },
        { index: 4, order: 1, value: 1 },
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
        { index: 1, order: 0, value: 0 },
        { index: 2, order: 0, value: 1 },
        { index: 3, order: 0, value: 2 },
        { index: 4, order: 0, value: 3 },
        { index: 5, order: 0, value: 4 },
        { index: 6, order: 0, value: 5 },
        { index: 7, order: 0, value: 6 },
      ]);
      heap.update(nodes[1], 0);
      assert.deepStrictEqual(inspect(heap), [
        { index: 1, order: 0, value: 0 },
        { index: 2, order: 0, value: 1 },
        { index: 3, order: 0, value: 2 },
        { index: 4, order: 0, value: 3 },
        { index: 5, order: 0, value: 4 },
        { index: 6, order: 0, value: 5 },
        { index: 7, order: 0, value: 6 },
      ]);
    });

    it('verify', async () => {
      const heap = new Heap<number>();

      const size = 1e4;
      const random = pcg32.random(pcg32.seed(0n, 0n));
      for (let i = 0; i < size; ++i) {
        const ord = random() * 1e6 | 0;
        heap.insert(ord, ord);
      }
      assert(heap.length === size);
      for (let i = 0, o = Infinity; i < size; ++i) {
        const node = heap.peek()!;
        assert(node.order <= o);
        o = node.order;
        heap.delete(node);
      }
      assert(heap.length === 0);
    });

  });

});
