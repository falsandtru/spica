import { Ring } from './ring';

describe('Unit: lib/ring', () => {
  describe('Ring', () => {
    it('push/shift', () => {
      const array = new Ring();
      assert(array.length === 0);
      assert(array.at(0) === undefined);
      assert(array.at(-1) === undefined);
      assert.deepStrictEqual(array.toArray(), []);
      assert(array.shift() === undefined);
      assert.deepStrictEqual(array['array'], []);
      assert(array.length === 0);
      assert.deepStrictEqual(array.toArray(), []);
      assert(array.push(0) === undefined);
      assert.deepStrictEqual(array['array'], [0]);
      assert(array.length === 1);
      assert(array.at(0) === 0);
      assert(array.at(-1) === 0);
      assert.deepStrictEqual(array.toArray(), [0]);
      assert(array.shift() === 0);
      assert(array.length === 0);
      assert.deepStrictEqual(array.toArray(), []);
      assert(array.shift() === undefined);
      assert(array.length === 0);
      assert(array.push(0) === undefined);
      assert.deepStrictEqual(array['array'], [0]);
      assert(array.length === 1);
      assert(array.push(1) === undefined);
      assert.deepStrictEqual(array['array'], [0, 1]);
      assert(array.length === 2);
      assert(array.at(0) === 0);
      assert(array.at(-1) === 1);
      assert(array.shift() === 0);
      assert(array.length === 1);
      assert(array.push(2) === undefined);
      assert.deepStrictEqual(array['array'], [2, 1]);
      assert(array.length === 2);
      assert.deepStrictEqual(array.toArray(), [1, 2]);
      assert(array.push(3) === undefined);
      assert.deepStrictEqual(array['array'], [2, 3, ...Array(99), 1]);
      assert(array.length === 3);
      assert.deepStrictEqual(array.toArray(), [1, 2, 3]);
      assert(array.shift() === 1);
      assert(array.length === 2);
      assert.deepStrictEqual(array.toArray(), [2, 3]);
      assert(array.shift() === 2);
      assert(array.length === 1);
      assert.deepStrictEqual(array.toArray(), [3]);
      assert(array.shift() === 3);
      assert(array.length === 0);
      assert.deepStrictEqual(array.toArray(), []);
      assert(array.shift() === undefined);
      assert.deepStrictEqual(array['array'], [...Array(102)]);
      assert(array.length === 0);
    });

    it('unshift/pop', () => {
      const array = new Ring();
      assert(array.pop() === undefined);
      assert(array.push(0) === undefined);
      assert(array.pop() === 0);
      assert(array.unshift(0) === undefined);
      assert.deepStrictEqual(array['array'], [0]);
      assert(array.length === 1);
      assert(array.pop() === 0);
      assert(array.unshift(0) === undefined);
      assert.deepStrictEqual(array['array'], [0]);
      assert(array.unshift(1) === undefined);
      assert.deepStrictEqual(array['array'], [0, 1]);
      assert(array.shift() === 1);
      assert(array.unshift(1) === undefined);
      assert.deepStrictEqual(array['array'], [0, 1]);
      assert(array.unshift(2) === undefined);
      assert.deepStrictEqual(array['array'], [0, ...Array(99), 2, 1]);
      assert(array.shift() === 2);
      assert(array.shift() === 1);
      assert(array.shift() === 0);
      assert.deepStrictEqual(array['array'], [...Array(102)]);
    });

  });

});
