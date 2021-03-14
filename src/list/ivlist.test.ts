import { List } from './ivlist';

describe('Unit: lib/ivlist', () => {
  describe('List', () => {
    it('', () => {
      const list = new List();

      assert(list.length === 0);
      assert(list.shift() === undefined);
      assert(list.pop() === undefined);
      assert(list.length === 0);
      assert(list.head === undefined);
      assert(list.length === 0);

      list.unshift(1);
      assert(list.length === 1);
      assert(list.shift() === 1);
      assert(list.length === 0);
      assert(list.shift() === undefined);
      assert(list.length === 0);

      list.push(1);
      assert(list.length === 1);
      assert(list.pop() === 1);
      assert(list.length === 0);
      assert(list.pop() === undefined);
      assert(list.length === 0);

      list.push(1);
      list.unshift(0);
      list.push(2);
      assert(list.length === 3);
      assert(list.shift() === 0);
      assert(list.pop() === 2);
      assert(list.length === 1);
    });
  });
});
