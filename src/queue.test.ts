import { Queue } from './queue';

describe('Unit: lib/queue', () => {
  describe('Queue', () => {
    it('push/pop', () => {
      const queue = new Queue();
      assert(queue.length === 0);
      assert(queue.peek() === undefined);
      assert(queue.pop() === undefined);
      assert(queue.length === 0);
      assert(queue.push(0) === undefined);
      assert(queue.length === 1);
      assert(queue.peek() === 0);
      assert(queue.pop() === 0);
      assert(queue.length === 0);
      assert(queue.pop() === undefined);
      assert(queue.length === 0);
      assert(queue.push(0) === undefined);
      assert(queue.length === 1);
      assert(queue.push(1) === undefined);
      assert(queue.length === 2);
      assert(queue.peek() === 0);
      assert(queue.pop() === 0);
      assert(queue.length === 1);
      assert(queue.push(2) === undefined);
      assert(queue.length === 2);
      assert(queue.push(3) === undefined);
      assert(queue.length === 3);
      assert(queue.pop() === 1);
      assert(queue.length === 2);
      assert(queue.pop() === 2);
      assert(queue.length === 1);
      assert(queue.pop() === 3);
      assert(queue.length === 0);
      assert(queue.pop() === undefined);
      assert(queue.length === 0);
    });

    it('at', () => {
      const queue = new Queue();
      assert(queue.peek() === undefined);
      assert(queue.peek(-1) === undefined);
      queue.push(1);
      assert(queue.peek() === 1);
      assert(queue.peek(-1) === 1);
      queue.push(2);
      assert(queue.peek() === 1);
      assert(queue.peek(-1) === 2);
      queue.pop();
      assert(queue.peek() === 2);
      assert(queue.peek(-1) === 2);
      queue.push(3);
      assert(queue.peek() === 2);
      assert(queue.peek(-1) === 3);
    });

    it('verify', () => {
      for (const size of [
        16 + 2048 * 0,
        16 + 2048 * 1,
        16 + 2048 * 2,
        16 + 2048 * 3,
      ]) {
        const queue = new Queue();
        for (let i = -2; i < 4; ++i) {
          const len = size + i;
          for (let i = 0; i < len; ++i) {
            queue.push(queue.length);
          }
          assert(queue.length === len);
          for (let i = 0; i < len; ++i) {
            assert(queue.pop() === len - queue.length - 1);
          }
          assert(queue.length === 0);
        }
      }
    });

  });

});
