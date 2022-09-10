import { Ring } from './ring';

describe('Unit: lib/ring', () => {
  describe('Ring', () => {
    function unempties(array: readonly unknown[]) {
      return array.map(v => typeof v === 'symbol' ? undefined : v);
    }

    it('push/shift', () => {
      const ring = new Ring();
      assert(ring.length === 0);
      assert(ring.at(0) === undefined);
      assert(ring.at(-1) === undefined);
      assert.deepStrictEqual(ring.toArray(), []);
      assert(ring.shift() === undefined);
      assert.deepStrictEqual(unempties(ring['array']), []);
      assert(ring.length === 0);
      assert.deepStrictEqual(ring.toArray(), []);
      assert(ring.push(0) === undefined);
      assert.deepStrictEqual(unempties(ring['array']), [0]);
      assert(ring.length === 1);
      assert(ring.at(0) === 0);
      assert(ring.at(-1) === 0);
      assert.deepStrictEqual(ring.toArray(), [0]);
      assert(ring.shift() === 0);
      assert(ring.length === 0);
      assert.deepStrictEqual(ring.toArray(), []);
      assert(ring.shift() === undefined);
      assert(ring.length === 0);
      assert(ring.push(0) === undefined);
      assert.deepStrictEqual(unempties(ring['array']), [0]);
      assert(ring.length === 1);
      assert(ring.push(1) === undefined);
      assert.deepStrictEqual(unempties(ring['array']), [0, 1]);
      assert(ring.length === 2);
      assert(ring.at(0) === 0);
      assert(ring.at(-1) === 1);
      assert(ring.shift() === 0);
      assert(ring.length === 1);
      assert(ring.push(2) === undefined);
      assert.deepStrictEqual(unempties(ring['array']), [2, 1]);
      assert(ring.length === 2);
      assert.deepStrictEqual(ring.toArray(), [1, 2]);
      assert(ring.push(3) === undefined);
      assert.deepStrictEqual(unempties(ring['array']), [2, 3, ...Array(99), 1]);
      assert(ring.length === 3);
      assert.deepStrictEqual(ring.toArray(), [1, 2, 3]);
      assert(ring.push(4) === undefined);
      assert.deepStrictEqual(unempties(ring['array']), [2, 3, 4, ...Array(98), 1]);
      assert(ring.length === 4);
      assert.deepStrictEqual(ring.toArray(), [1, 2, 3, 4]);
      assert(ring.shift() === 1);
      assert(ring.length === 3);
      assert.deepStrictEqual(ring.toArray(), [2, 3, 4]);
      assert(ring.shift() === 2);
      assert(ring.length === 2);
      assert.deepStrictEqual(ring.toArray(), [3, 4]);
      assert(ring.shift() === 3);
      assert(ring.length === 1);
      assert.deepStrictEqual(ring.toArray(), [4]);
      assert(ring.shift() === 4);
      assert(ring.length === 0);
      assert.deepStrictEqual(ring.toArray(), []);
      assert(ring.shift() === undefined);
      assert.deepStrictEqual(unempties(ring['array']), [...Array(102)]);
      assert(ring.length === 0);
    });

    it('unshift/pop', () => {
      const ring = new Ring();
      assert(ring.pop() === undefined);
      assert(ring.push(0) === undefined);
      assert(ring.pop() === 0);
      assert(ring.unshift(0) === undefined);
      assert.deepStrictEqual(unempties(ring['array']), [0]);
      assert(ring.length === 1);
      assert(ring.pop() === 0);
      assert(ring.unshift(0) === undefined);
      assert.deepStrictEqual(unempties(ring['array']), [0]);
      assert(ring.unshift(1) === undefined);
      assert.deepStrictEqual(unempties(ring['array']), [0, 1]);
      assert(ring.shift() === 1);
      assert(ring.unshift(1) === undefined);
      assert.deepStrictEqual(unempties(ring['array']), [0, 1]);
      assert(ring.unshift(2) === undefined);
      assert.deepStrictEqual(unempties(ring['array']), [0, ...Array(99), 2, 1]);
      assert(ring.unshift(3) === undefined);
      assert.deepStrictEqual(unempties(ring['array']), [0, ...Array(98), 3, 2, 1]);
      assert(ring.shift() === 3);
      assert(ring.shift() === 2);
      assert(ring.shift() === 1);
      assert(ring.shift() === 0);
      assert.deepStrictEqual(unempties(ring['array']), [...Array(102)]);
    });

    it('splice', () => {
      const ring = new Ring();
      assert.deepStrictEqual(ring.splice(0, 0), []);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [0, 0, 0, []]);
      assert.deepStrictEqual(ring.splice(0, 1), []);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [0, 0, 0, []]);
      assert.deepStrictEqual(ring.splice(1, 1), []);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [0, 0, 0, []]);
      assert.deepStrictEqual(ring.splice(-1, -1), []);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [0, 0, 0, []]);
      ring.clear();
      ring.push(1); ring.push(2);
      assert.deepStrictEqual(ring.splice(2, 1), []);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [1, 2, 2, [1, 2]]);
      assert.deepStrictEqual(ring.splice(3, 1, 3), []);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [1, 3, 3, [1, 2, 3]]);
      assert.deepStrictEqual(ring.splice(0, 0, 0), []);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [1, 4, 4, [0, 1, 2, 3]]);
      ring.clear();
      ring.push(1); ring.push(2);
      assert.deepStrictEqual(ring.splice(0, 1, 0), [1]);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [1, 2, 2, [0, 2]]);
      assert.deepStrictEqual(ring.splice(1, 0), []);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [1, 2, 2, [0, 2]]);
      assert.deepStrictEqual(ring.splice(1, 0, 1), []);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [1, 3, 3, [0, 1, 2]]);
      assert.deepStrictEqual(ring.splice(1, 1, -1), [1]);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [1, 3, 3, [0, -1, 2]]);
      assert.deepStrictEqual(ring.splice(3, 1, 3), []);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [1, 4, 4, [0, -1, 2, 3]]);
      assert.deepStrictEqual(ring.splice(-2, 1), [2]);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [1, 3, 3, [0, -1, 3]]);
      assert.deepStrictEqual(ring.splice(-1, 0, 2), []);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [1, 4, 4, [0, -1, 2, 3]]);
      assert.deepStrictEqual(ring.splice(-3, 1, 1), [-1]);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [1, 4, 4, [0, 1, 2, 3]]);
      ring.clear();
      ring.push(3); ring.push(4); ring.unshift(2); ring.unshift(1);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [102, 2, 4, [3, 4, ...Array(99), 1, 2]]);
      assert.deepStrictEqual(ring.splice(0, 1, -1), [1]);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [102, 2, 4, [3, 4, ...Array(99), -1, 2]]);
      assert.deepStrictEqual(ring.splice(1, 2, -2, -3), [2, 3]);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [102, 2, 4, [-3, 4, ...Array(99), -1, -2]]);
      assert.deepStrictEqual(ring.splice(3, 2, -4, 5), [4]);
      assert.deepStrictEqual(
        [ring['head'], ring['tail'], ring['length'], unempties(ring['array'])],
        [103, 3, 5, [-3, -4, 5, ...Array(99), -1, -2]]);
    });

    it('replace', () => {
      const ring = new Ring<number>();
      ring.push(1); ring.push(2); ring.push(3);
      assert.deepStrictEqual(unempties(ring['array']), [1, 2, 3]);
      assert(ring.replace(0, -1) === 1);
      assert.deepStrictEqual(unempties(ring['array']), [-1, 2, 3]);
      assert(ring.replace(-1, -3) === 3);
      assert.deepStrictEqual(unempties(ring['array']), [-1, 2, -3]);
      assert(ring.replace(-3, 1) === -1);
      assert.deepStrictEqual(unempties(ring['array']), [1, 2, -3]);
      assert(ring.replace(1, -1, (o, n) => o / n) === 2);
      assert.deepStrictEqual(unempties(ring['array']), [1, -2, -3]);
      assert.throws(() => ring.replace(3, 0));
      assert.throws(() => ring.replace(-4, 0));
    });

  });

});
