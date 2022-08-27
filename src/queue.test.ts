import { Queue } from './queue';

describe('Unit: lib/queue', () => {
  describe('Queue', () => {
    it('', () => {
      const queue = new Queue();
      assert(queue.length === 0);
      assert(queue.dequeue() === undefined);
      assert(queue.length === 0);
      assert(queue.enqueue(0) === undefined);
      assert(queue.length === 1);
      assert(queue.dequeue() === 0);
      assert(queue.length === 0);
      assert(queue.dequeue() === undefined);
      assert(queue.length === 0);
      assert(queue.enqueue(0) === undefined);
      assert(queue.length === 1);
      assert(queue.enqueue(1) === undefined);
      assert(queue.length === 2);
      assert(queue.dequeue() === 0);
      assert(queue.length === 1);
      assert(queue.enqueue(2) === undefined);
      assert(queue.length === 2);
      assert(queue['array'].length === 2);
      assert(queue.enqueue(3) === undefined);
      assert(queue.length === 3);
      assert(queue['array'].length === 102);
      assert(queue.dequeue() === 1);
      assert(queue.length === 2);
      assert(queue.dequeue() === 2);
      assert(queue.length === 1);
      assert(queue.dequeue() === 3);
      assert(queue.length === 0);
      assert(queue.dequeue() === undefined);
      assert(queue.length === 0);
    });
  });

});
