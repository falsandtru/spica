import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/iterate', () => {
  describe('iterate', () => {
    it('', () => {
      let thunk = new Sequence<number, number>((n = 0, cons) => cons()).iterate();
      assert.deepStrictEqual(thunk, [void 0, Sequence.Iterator.done, -1]);

      thunk = new Sequence<number, number>((n = 0, cons) => cons(n)).iterate();
      assert.deepStrictEqual(thunk, [0, Sequence.Thunk.iterator(thunk), 0]);

      thunk = new Sequence<number, number>((n = 1, cons) => n < 4 ? cons(n, n * 2) : cons(n)).iterate();
      assert.deepStrictEqual(thunk, [1, Sequence.Thunk.iterator(thunk), 0]);
      thunk = Sequence.Thunk.iterator(thunk)();
      assert.deepStrictEqual(thunk, [2, Sequence.Thunk.iterator(thunk), 1]);
      thunk = Sequence.Thunk.iterator(thunk)();
      assert.deepStrictEqual(thunk, [4, Sequence.Thunk.iterator(thunk), 2]);
      thunk = Sequence.Thunk.iterator(thunk)();
      assert.deepStrictEqual(thunk, [void 0, Sequence.Iterator.done, -1]);
    });

  });

});
