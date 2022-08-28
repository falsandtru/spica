import { Queue } from './queue';

describe('Unit: lib/queue', () => {
  describe('Queue', () => {
    it('enqueue/dequeue', () => {
      const queue = new Queue();
      assert(queue.length === 0);
      assert(queue.at(0) === undefined);
      assert(queue.at(-1) === undefined);
      assert.deepStrictEqual(queue.toArray(), []);
      assert(queue.dequeue() === undefined);
      assert.deepStrictEqual(queue['array'], []);
      assert(queue.length === 0);
      assert.deepStrictEqual(queue.toArray(), []);
      assert(queue.enqueue(0) === undefined);
      assert.deepStrictEqual(queue['array'], [0]);
      assert(queue.length === 1);
      assert(queue.at(0) === 0);
      assert(queue.at(-1) === 0);
      assert.deepStrictEqual(queue.toArray(), [0]);
      assert(queue.dequeue() === 0);
      assert(queue.length === 0);
      assert.deepStrictEqual(queue.toArray(), []);
      assert(queue.dequeue() === undefined);
      assert(queue.length === 0);
      assert(queue.enqueue(0) === undefined);
      assert.deepStrictEqual(queue['array'], [0]);
      assert(queue.length === 1);
      assert(queue.enqueue(1) === undefined);
      assert.deepStrictEqual(queue['array'], [0, 1]);
      assert(queue.length === 2);
      assert(queue.at(0) === 0);
      assert(queue.at(-1) === 1);
      assert(queue.dequeue() === 0);
      assert(queue.length === 1);
      assert(queue.enqueue(2) === undefined);
      assert.deepStrictEqual(queue['array'], [2, 1]);
      assert(queue.length === 2);
      assert.deepStrictEqual(queue.toArray(), [1, 2]);
      assert(queue.enqueue(3) === undefined);
      assert.deepStrictEqual(queue['array'], [2, 3, ...Array(99), 1]);
      assert(queue.length === 3);
      assert.deepStrictEqual(queue.toArray(), [1, 2, 3]);
      assert(queue.dequeue() === 1);
      assert(queue.length === 2);
      assert.deepStrictEqual(queue.toArray(), [2, 3]);
      assert(queue.dequeue() === 2);
      assert(queue.length === 1);
      assert.deepStrictEqual(queue.toArray(), [3]);
      assert(queue.dequeue() === 3);
      assert(queue.length === 0);
      assert.deepStrictEqual(queue.toArray(), []);
      assert(queue.dequeue() === undefined);
      assert.deepStrictEqual(queue['array'], [...Array(102)]);
      assert(queue.length === 0);
    });

    it('unshift/pop', () => {
      const queue = new Queue();
      assert(queue.pop() === undefined);
      assert(queue.push(0) === undefined);
      assert(queue.pop() === 0);
      assert(queue.unshift(0) === undefined);
      assert.deepStrictEqual(queue['array'], [0]);
      assert(queue.length === 1);
      assert(queue.pop() === 0);
      assert(queue.unshift(0) === undefined);
      assert.deepStrictEqual(queue['array'], [0]);
      assert(queue.unshift(1) === undefined);
      assert.deepStrictEqual(queue['array'], [0, 1]);
      assert(queue.shift() === 1);
      assert(queue.unshift(1) === undefined);
      assert.deepStrictEqual(queue['array'], [0, 1]);
      assert(queue.unshift(2) === undefined);
      assert.deepStrictEqual(queue['array'], [0, ...Array(99), 2, 1]);
      assert(queue.shift() === 2);
      assert(queue.shift() === 1);
      assert(queue.shift() === 0);
      assert.deepStrictEqual(queue['array'], [...Array(102)]);
    });

  });

});
