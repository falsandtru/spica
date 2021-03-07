import { Stack } from './stack';

describe('Unit: lib/stack', () => {
  describe('Stack', () => {
    it('', () => {
      const stack = new Stack();
      assert(stack.pop() === undefined);
      assert(stack.push(0) === undefined);
      assert(stack.pop() === 0);
      assert(stack.pop() === undefined);
      assert(stack.push(0) === undefined);
      assert(stack.push(1) === undefined);
      assert(stack.pop() === 1);
      assert(stack.push(2) === undefined);
      assert(stack.pop() === 2);
      assert(stack.pop() === 0);
      assert(stack.pop() === undefined);
    });
  });

});
