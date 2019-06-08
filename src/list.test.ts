import { List, Nil } from './list';

describe('Unit: lib/list', () => {
  describe('List', () => {
    it('List 0', () => {
      const list: List<[]> = Nil;
      assert.deepStrictEqual(list.tuple(), []);
    });

    it('List 1', () => {
      const list: List<[number]> = Nil.push(0);
      assert.deepStrictEqual(list.tuple(), [0]);
    });

    it('List 2', () => {
      const list: List<[number, number]> = Nil.push(0).push(1);
      assert.deepStrictEqual(list.tuple(), [1, 0]);
    });

    it('head', () => {
      assert(Nil.push(0).head === 0);
      assert(Nil.push(0).push(1).head === 1);
    });

    it('tail', () => {
      assert.deepStrictEqual(Nil.push(0).push(1).tail.tuple(), [0]);
      assert.deepStrictEqual(Nil.push(0).push(1).push(2).tail.tuple(), [1, 0]);
    });

    it('walk', () => {
      assert.deepStrictEqual(Nil.push(0).push(1).walk(n => assert(n === 1)).tuple(), [0]);
    });

    it('modify', () => {
      assert.deepStrictEqual(Nil.push(0).push(1).modify(n => ++n).tuple(), [2, 0]);
    });

    it('extend', () => {
      assert.deepStrictEqual(Nil.push(0).extend(n => ++n).tuple(), [1, 0]);
    });

    it('compact', () => {
      {
        const l: List<[number]> = Nil.push(1).push(2).compact((n, m) => n - m);
        assert.deepStrictEqual(l.tuple(), [1]);
      }
      {
        const l: List<[number, number]> = Nil.push(1).push(2).push(5).compact((n, m) => n - m);
        assert.deepStrictEqual(l.tuple(), [3, 1]);
      }
    });

    it('reverse', () => {
      assert.deepStrictEqual(Nil.push(0).push(1).push(2).reverse(), [0, 1, 2]);
    });

    it('tuple', () => {
      {
        const t: [number] = Nil.push(1).tuple();
        assert.deepStrictEqual(t, [1]);
      }
      {
        const t: [number, number] = Nil.push(2).push(1).tuple();
        assert.deepStrictEqual(t, [1, 2]);
      }
      {
        const t: [number, number, number] = Nil.push(3).push(2).push(1).tuple();
        assert.deepStrictEqual(t, [1, 2, 3]);
      }
    });

  });

});
