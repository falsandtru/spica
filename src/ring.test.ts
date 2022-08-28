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
      assert(array.push(4) === undefined);
      assert.deepStrictEqual(array['array'], [2, 3, 4, ...Array(98), 1]);
      assert(array.length === 4);
      assert.deepStrictEqual(array.toArray(), [1, 2, 3, 4]);
      assert(array.shift() === 1);
      assert(array.length === 3);
      assert.deepStrictEqual(array.toArray(), [2, 3, 4]);
      assert(array.shift() === 2);
      assert(array.length === 2);
      assert.deepStrictEqual(array.toArray(), [3, 4]);
      assert(array.shift() === 3);
      assert(array.length === 1);
      assert.deepStrictEqual(array.toArray(), [4]);
      assert(array.shift() === 4);
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
      assert(array.unshift(3) === undefined);
      assert.deepStrictEqual(array['array'], [0, ...Array(98), 3, 2, 1]);
      assert(array.shift() === 3);
      assert(array.shift() === 2);
      assert(array.shift() === 1);
      assert(array.shift() === 0);
      assert.deepStrictEqual(array['array'], [...Array(102)]);
    });

    it('splice', () => {
      const array = new Ring();
      assert.deepStrictEqual(array.splice(0, 0), []);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [0, 0, 0, []]);
      assert.deepStrictEqual(array.splice(0, 1), []);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [0, 0, 0, []]);
      assert.deepStrictEqual(array.splice(1, 1), []);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [0, 0, 0, []]);
      assert.deepStrictEqual(array.splice(-1, -1), []);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [0, 0, 0, []]);
      array.clear();
      array.push(1); array.push(2);
      assert.deepStrictEqual(array.splice(2, 1), []);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [1, 2, 2, [1, 2]]);
      assert.deepStrictEqual(array.splice(3, 1, 3), []);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [1, 3, 3, [1, 2, 3]]);
      assert.deepStrictEqual(array.splice(0, 0, 0), []);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [1, 4, 4, [0, 1, 2, 3]]);
      array.clear();
      array.push(1); array.push(2);
      assert.deepStrictEqual(array.splice(0, 1, 0), [1]);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [1, 2, 2, [0, 2]]);
      assert.deepStrictEqual(array.splice(1, 0), []);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [1, 2, 2, [0, 2]]);
      assert.deepStrictEqual(array.splice(1, 0, 1), []);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [1, 3, 3, [0, 1, 2]]);
      assert.deepStrictEqual(array.splice(1, 1, -1), [1]);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [1, 3, 3, [0, -1, 2]]);
      assert.deepStrictEqual(array.splice(3, 1, 3), []);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [1, 4, 4, [0, -1, 2, 3]]);
      assert.deepStrictEqual(array.splice(-2, 1), [2]);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [1, 3, 3, [0, -1, 3]]);
      assert.deepStrictEqual(array.splice(-1, 0, 2), []);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [1, 4, 4, [0, -1, 2, 3]]);
      assert.deepStrictEqual(array.splice(-3, 1, 1), [-1]);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [1, 4, 4, [0, 1, 2, 3]]);
      array.clear();
      array.push(3); array.push(4); array.unshift(2); array.unshift(1);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [102, 2, 4, [3, 4, ...Array(99), 1, 2]]);
      assert.deepStrictEqual(array.splice(0, 1, -1), [1]);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [102, 2, 4, [3, 4, ...Array(99), -1, 2]]);
      assert.deepStrictEqual(array.splice(1, 2, -2, -3), [2, 3]);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [102, 2, 4, [-3, 4, ...Array(99), -1, -2]]);
      assert.deepStrictEqual(array.splice(3, 2, -4, 5), [4]);
      assert.deepStrictEqual(
        [array['head'], array['tail'], array['length'], array['array']],
        [103, 3, 5, [-3, -4, 5, ...Array(99), -1, -2]]);
    });

    it('replace', () => {
      const array = new Ring<number>();
      array.push(1); array.push(2); array.push(3);
      assert.deepStrictEqual(array['array'], [1, 2, 3]);
      assert(array.replace(0, -1) === 1);
      assert.deepStrictEqual(array['array'], [-1, 2, 3]);
      assert(array.replace(-1, -3) === 3);
      assert.deepStrictEqual(array['array'], [-1, 2, -3]);
      assert(array.replace(-3, 1) === -1);
      assert.deepStrictEqual(array['array'], [1, 2, -3]);
      assert(array.replace(1, -1, (o, n) => o / n) === 2);
      assert.deepStrictEqual(array['array'], [1, -2, -3]);
      assert.throws(() => array.replace(3, 0));
      assert.throws(() => array.replace(-4, 0));
    });

  });

});
