import { List } from './clist';

describe('Unit: lib/clist', () => {
  describe('List', () => {
    it('', () => {
      class Node<T> {
        constructor(public value: T) {
        }
        public next?: this;
        public prev?: this;
      }
      const list = new List<Node<number>>();

      assert(list.length === 0);
      assert(list.shift() === undefined);
      assert(list.pop() === undefined);
      assert(list.length === 0);
      assert(list.head === undefined);
      assert(list.length === 0);

      list.unshift(new Node(1));
      assert(list.length === 1);
      assert(list.shift()?.value === 1);
      assert(list.length === 0);
      assert(list.shift() === undefined);
      assert(list.length === 0);

      list.push(new Node(1));
      assert(list.length === 1);
      assert(list.pop()?.value === 1);
      assert(list.length === 0);
      assert(list.pop() === undefined);
      assert(list.length === 0);

      list.push(new Node(1));
      list.unshift(new Node(0));
      list.push(new Node(2));
      assert(list.length === 3);
      assert(list.shift()?.value === 0);
      assert(list.pop()?.value === 2);
      assert(list.length === 1);
    });
  });
});
