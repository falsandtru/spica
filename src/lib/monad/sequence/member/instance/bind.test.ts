import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/bind', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));

  describe('bind', () => {
    it('0', () => {
      assert.deepStrictEqual(
        nat
          .bind(n => new Sequence<number, number>((m = 0, cons) => m < n ? cons(m, m + 1) : cons()))
          .take(0)
          .extract(),
        []);
    });

    it('1', () => {
      assert.deepStrictEqual(
        nat
          .bind(n => new Sequence<number, number>((m = 0, cons) => m < n ? cons(m, m + 1) : cons()))
          .take(1)
          .extract(),
        [0]);
    });

    it('1 + 1', () => {
      assert.deepStrictEqual(
        nat
          .bind(n => new Sequence<number, number>((m = 0, cons) => m < n ? cons(m, m + 1) : cons()))
          .take(2)
          .extract(),
        [0, 0]);
    });

    it('1 + 2', () => {
      assert.deepStrictEqual(
        nat
          .bind(n => new Sequence<number, number>((m = 0, cons) => m < n ? cons(m, m + 1) : cons()))
          .take(3)
          .extract(),
        [0, 0, 1]);
    });

    it('1 + 2 + 3 + 1', () => {
      assert.deepStrictEqual(
        nat
          .bind(n => new Sequence<number, number>((m = 0, cons) => m < n ? cons(m, m + 1) : cons()))
          .take(7)
          .extract(),
        [0, 0, 1, 0, 1, 2, 0]);
    });

    it('nothing', () => {
      assert.deepStrictEqual(
        nat
          .take(3)
          .bind(_ => Sequence.from([]))
          .take(Infinity)
          .extract(),
        []);
    });

    it('combination', () => {
      assert.deepStrictEqual(
        nat
          .take(3)
          .bind(n => Sequence.from([n, -n]))
          .take(Infinity)
          .extract(),
        [0, 0, 1, -1, 2, -2]);
    });

  });

});
