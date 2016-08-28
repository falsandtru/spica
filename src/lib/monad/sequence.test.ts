import {Sequence} from './sequence';
import {curry} from '../curry';

describe('Unit: lib/monad/sequence', () => {
  describe('Monoid', () => {
    it('Monoid law 1', () => {
      const x = Sequence.Return(0);
      const ma = Sequence.mappend(Sequence.mempty, x);
      assert.deepStrictEqual(ma.extract(), x.extract());
    });

    it('Monoid law 2', () => {
      const x = Sequence.Return(0);
      const ma = Sequence.mappend(x, Sequence.mempty);
      assert.deepStrictEqual(ma.extract(), x.extract());
    });

    it('Monoid law 3', () => {
      const x = Sequence.Return(0);
      const y = Sequence.Return(1);
      const z = Sequence.Return(2);
      const ma = Sequence.mappend(Sequence.mappend(x, y), z);
      const mb = Sequence.mappend(x, Sequence.mappend(y, z));
      assert.deepStrictEqual(ma.extract(), mb.extract());
    });

  });

  describe('Functor', () => {
    it('fmap', () => {
      assert.deepStrictEqual(Sequence.fmap(Sequence.Return(0), n => n + 1).extract(), [1]);
      assert.deepStrictEqual(Sequence.fmap(Sequence.Return(0))(n => n + 1).extract(), [1]);
    });

    it('Functor law 1', () => {
      const f = <T>(n: T) => n;
      const x = 0;
      const fa = Sequence.Return(x).fmap(f);
      const fb = f(Sequence.Return(x));
      assert.deepStrictEqual(fa.extract(), fb.extract());
    });

    it('Functor law 2', () => {
      const f = (n: number) => n + 2;
      const g = (n: number) => n * 3;
      const x = 1;
      const fa = Sequence.Return(x).fmap(n => g(f(n)));
      const fb = Sequence.Return(x).fmap(f).fmap(g);
      assert.deepStrictEqual(fa.extract(), fb.extract());
    });

  });

  describe('Applicative', () => {
    it('ap 1', () => {
      assert.deepStrictEqual(
        Sequence.ap(
          Sequence.pure(curry((a: number) => a)))
          (Sequence.pure(1))
          .extract(),
        [1]);
      assert.deepStrictEqual(
        Sequence.ap(
          Sequence.pure(curry((a: number) => a)),
          (Sequence.pure(1)))
          .extract(),
        [1]);
    });

    it('ap 2', () => {
      assert.deepStrictEqual(
        Sequence.ap(Sequence.ap(
          Sequence.pure(curry((a: number, b: number) => a + b)))
          (Sequence.pure(1)))
          (Sequence.pure(2))
          .extract(),
        [3]);
    });

    it('ap 3', () => {
      assert.deepStrictEqual(
        Sequence.ap(Sequence.ap(Sequence.ap(
          Sequence.pure(curry((a: number, b: number, c: number) => a + b + c)))
          (Sequence.pure(1)))
          (Sequence.pure(2)))
          (Sequence.pure(3))
          .extract(),
        [6]);
    });

  });

  describe('Monad', () => {
    it('bind', () => {
      assert.deepStrictEqual(Sequence.bind(Sequence.Return(0), n => Sequence.Return(n + 1)).extract(), [1]);
      assert.deepStrictEqual(Sequence.bind(Sequence.Return(0))(n => Sequence.Return(n + 1)).extract(), [1]);
    });

    it('Monad law 1', () => {
      const f = (n: number) => Sequence.Return(n + 1);
      const x = 0;
      const ma = Sequence.Return(x).bind(f);
      const mb = f(x);
      assert.deepStrictEqual(ma.extract(), mb.extract());
    });

    it('Monad law 2', () => {
      const x = 0;
      const ma = Sequence.Return(x);
      const mb = ma.bind(Sequence.Return);
      assert.deepStrictEqual(ma.extract(), mb.extract());
    });

    it('Monad law 3', () => {
      const f = (n: number) => Sequence.Return(n + 2);
      const g = (n: number) => Sequence.Return(n * 3);
      const x = 1;
      const ma = Sequence.Return(x)
        .bind(f)
        .bind(g);
      const mb = Sequence.Return(x)
        .bind(x =>
          f(x)
            .bind(g));
      assert.deepStrictEqual(ma.extract(), mb.extract());
    });

  });

});
