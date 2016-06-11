import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/bind', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));
  const double = nat.map(n => n * 2);
  const triple = nat.map(n => n * 3);

  describe('bind', () => {
    it('0', () => {
      assert.deepStrictEqual(
        nat
          .bind(n => new Sequence<number, number>((m = 0, cons) => m < n ? cons(m, m + 1) : cons()))
          .take(0)
          .read(),
        []);
    });

    it('1', () => {
      assert.deepStrictEqual(
        nat
          .bind(n => new Sequence<number, number>((m = 0, cons) => m < n ? cons(m, m + 1) : cons()))
          .take(1)
          .read(),
        [0]);
    });

    it('1 + 1', () => {
      assert.deepStrictEqual(
        nat
          .bind(n => new Sequence<number, number>((m = 0, cons) => m < n ? cons(m, m + 1) : cons()))
          .take(2)
          .read(),
        [0, 0]);
    });

    it('1 + 2', () => {
      assert.deepStrictEqual(
        nat
          .bind(n => new Sequence<number, number>((m = 0, cons) => m < n ? cons(m, m + 1) : cons()))
          .take(3)
          .read(),
        [0, 0, 1]);
    });

    it('1 + 2 + 3 + 1', () => {
      assert.deepStrictEqual(
        nat
          .bind(n => new Sequence<number, number>((m = 0, cons) => m < n ? cons(m, m + 1) : cons()))
          .take(7)
          .read(),
        [0, 0, 1, 0, 1, 2, 0]);
    });

    it('nothing', () => {
      assert.deepStrictEqual(
        nat
          .take(3)
          .bind(n => Sequence.from([]))
          .take(Infinity)
          .read(),
        []);
    });

    it('combination', () => {
      assert.deepStrictEqual(
        nat
          .take(3)
          .bind(n => Sequence.from([n, -n]))
          .take(Infinity)
          .read(),
        [0, 0, 1, -1, 2, -2]);
    });

  });

});
