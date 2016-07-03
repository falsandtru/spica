import {List, Nil} from './list';

describe('Unit: lib/list', () => {
  describe('List', () => {
    it('Nil', () => {
      const nil = new Nil();
    });

    it('List 1', () => {
      const list: List<number, Nil> = new Nil().push(0);
      assert.deepStrictEqual(list.array(), [0]);
    });

    it('List 2', () => {
      const list: List<number, List<number, Nil>> = new Nil().push(0).push(1);
      assert.deepStrictEqual(list.array(), [1, 0]);
    });

    it('List 1+', () => {
      const list: List<number, Nil | List<number, any>> = new Nil().push(0).push(1);
      assert.deepStrictEqual(list.array(), [1, 0]);
    });

    it('head', () => {
      assert(new Nil().push(0).head() === 0);
      assert(new Nil().push(0).push(1).head() === 1);
    });

    it('tail', () => {
      assert.deepStrictEqual(new Nil().push(0).push(1).tail().array(), [0]);
      assert.deepStrictEqual(new Nil().push(0).push(1).push(2).tail().array(), [1, 0]);
    });

    it('walk', () => {
      assert.deepStrictEqual(new Nil().push(0).push(1).walk(n => assert(n === 1)).array(), [0]);
    });

    it('modify', () => {
      assert.deepStrictEqual(new Nil().push(0).push(1).modify(n => ++n).array(), [2, 0]);
    });

    it('extend', () => {
      assert.deepStrictEqual(new Nil().push(0).extend(n => ++n).array(), [1, 0]);
    });

  });

});
