import { Queue } from './queue';

describe('Unit: lib/queue', () => {
  describe('Queue', () => {
    it('push/pop', () => {
      const queue = new Queue();
      assert(queue.length === 0);
      assert(queue.peek() === undefined);
      assert.deepStrictEqual(queue.toArray(), []);
      assert(queue.pop() === undefined);
      assert.deepStrictEqual([queue['buffer'], queue['queue']], [[], []]);
      assert(queue.length === 0);
      assert.deepStrictEqual(queue.toArray(), []);
      assert(queue.push(0) === undefined);
      assert.deepStrictEqual([queue['buffer'], queue['queue']], [[0], []]);
      assert(queue.length === 1);
      assert(queue.peek() === 0);
      assert.deepStrictEqual(queue.toArray(), [0]);
      assert(queue.pop() === 0);
      assert.deepStrictEqual([queue['buffer'], queue['queue']], [[], [undefined]]);
      assert(queue.length === 0);
      assert.deepStrictEqual(queue.toArray(), []);
      assert(queue.pop() === undefined);
      assert.deepStrictEqual([queue['buffer'], queue['queue']], [[], [undefined]]);
      assert(queue.length === 0);
      assert(queue.push(0) === undefined);
      assert.deepStrictEqual([queue['buffer'], queue['queue']], [[0], [undefined]]);
      assert(queue.length === 1);
      assert(queue.push(1) === undefined);
      assert.deepStrictEqual([queue['buffer'], queue['queue']], [[0, 1], [undefined]]);
      assert(queue.length === 2);
      assert(queue.peek() === 0);
      assert(queue.pop() === 0);
      assert(queue.length === 1);
      assert(queue.push(2) === undefined);
      assert.deepStrictEqual([queue['buffer'], queue['queue']], [[2], [undefined, 1]]);
      assert(queue.length === 2);
      assert.deepStrictEqual(queue.toArray(), [1, 2]);
      assert(queue.push(3) === undefined);
      assert.deepStrictEqual([queue['buffer'], queue['queue']], [[2, 3], [undefined, 1]]);
      assert(queue.length === 3);
      assert.deepStrictEqual(queue.toArray(), [1, 2, 3]);
      assert(queue.pop() === 1);
      assert(queue.length === 2);
      assert.deepStrictEqual(queue.toArray(), [2, 3]);
      assert(queue.pop() === 2);
      assert(queue.length === 1);
      assert.deepStrictEqual(queue.toArray(), [3]);
      assert(queue.pop() === 3);
      assert(queue.length === 0);
      assert.deepStrictEqual(queue.toArray(), []);
      assert(queue.pop() === undefined);
      assert.deepStrictEqual([queue['buffer'], queue['queue']], [[undefined, undefined], [undefined, undefined]]);
      assert(queue.length === 0);
    });

  });

});
