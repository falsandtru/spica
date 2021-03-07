import { Queue } from './queue';

describe('Unit: lib/queue', () => {
  describe('Queue', () => {
    it('', () => {
      const queue = new Queue();
      assert(queue.dequeue() === undefined);
      assert(queue.enqueue(0) === undefined);
      assert(queue.dequeue() === 0);
      assert(queue.dequeue() === undefined);
      assert(queue.enqueue(0) === undefined);
      assert(queue.enqueue(1) === undefined);
      assert(queue.dequeue() === 0);
      assert(queue.enqueue(2) === undefined);
      assert(queue.dequeue() === 1);
      assert(queue.dequeue() === 2);
      assert(queue.dequeue() === undefined);
    });
  });

});
