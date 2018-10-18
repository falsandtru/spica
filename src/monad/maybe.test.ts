import { Maybe, Just, Nothing } from './maybe';
import { Sequence } from './sequence';

describe('Unit: lib/maybe', () => {
  const Return = Maybe.Return;

  function throwError(msg: string): never {
    throw new Error(msg);
  }

  describe('Maybe', () => {
    it('Just', () => {
      const result = Return(0)
        .bind(n => Just(n + 1))
        .bind(n => Just(n + 1).bind(n => Just(`Just ${n}`)))
        .extract(() => 'Nothing');
      assert(result === 'Just 2');
    });

    it('Just nest', () => {
      const result = Return(Return(0))
        .bind(m => Just(m))
        .bind(m => m.bind(n => Just(n + 1)).bind(n => Just(`Just ${n}`)))
        .extract(() => 'Nothing');
      assert(result === 'Just 1');
    });

    it('Nothing', () => {
      const result = Return(0)
        .bind(n => Just(n + 1))
        .bind(n => Just(`Just ${n}`).bind(_ => Nothing))
        .bind(throwError)
        .extract(() => 'Nothing');
      assert(result === 'Nothing');
      try {
        Nothing.extract();
        throw 1;
      }
      catch (reason) {
        assert(reason === undefined);
      }
    });

    it('Nothing nest', () => {
      const result = Return(Return(''))
        .bind(m => m.bind(_ => Nothing).bind(throwError))
        .bind(throwError)
        .extract(() => 'Nothing');
      assert(result === 'Nothing');
    });

    it('maybe', () => {
      assert(Just(0).extract(() => -1, n => n + 1) === 1);
      assert(Nothing.extract(() => -1, _ => 0 + 1) === -1);
    });

    it('Call-by-need and Memoize', () => {
      let n = NaN;
      const m1 = Return(NaN)
        .bind(_ => Just(++n));
      const m2 = m1
        .bind(_ => Just(++n));
      n = 0;
      assert(m2.extract() === 2);
      assert(m2.extract() === 2);
      assert(m2.extract() === 2);
      assert(m1.extract() === 1);
      assert(m1.extract() === 1);
      assert(m1.extract() === 1);
    });

  });

  describe('Functor', () => {
    it('fmap', () => {
      assert(Maybe.fmap(Return(0), n => n + 1).extract() === 1);
      assert(Maybe.fmap(Return(0))(n => n + 1).extract() === 1);
    });

    it('Functor law 1', () => {
      const f = <T>(n: T) => n;
      const x = 0;
      const fa = Return(x).fmap(f);
      const fb = f(Return(x));
      assert(fa.extract() === fb.extract());
    });

    it('Functor law 2', () => {
      const f = (n: number) => n + 2;
      const g = (n: number) => n * 3;
      const x = 1;
      const fa = Return(x).fmap(n => g(f(n)));
      const fb = Return(x).fmap(f).fmap(g);
      assert(fa.extract() === fb.extract());
    });

  });

  describe('Applicative', () => {
    it('ap 1', () => {
      assert.strictEqual(
        Maybe.pure((a: number) => a)
          .ap(Maybe.pure(1))
          .extract(),
        1);
      assert.strictEqual(
        Maybe.pure((a: number) => a)
          .ap(Nothing)
          .extract(() => 0),
        0);
      assert.strictEqual(
        Maybe.pure(throwError)
          .ap(Nothing)
          .extract(() => 0),
        0);
    });

    it('ap 2', () => {
      assert.strictEqual(
        Maybe.pure((a: number, b: number) => a + b)
          .ap(Maybe.pure(1))
          .ap(Maybe.pure(2))
          .extract(),
        3);
    });

    it('ap 3', () => {
      assert.strictEqual(
        Maybe.pure((a: number, b: number, c: number) => a + b + c)
          .ap(Maybe.pure(1))
          .ap(Maybe.pure(2))
          .ap(Maybe.pure(3))
          .extract(),
        6);
    });

  });

  describe('Monad', () => {
    it('bind', () => {
      assert(Maybe.bind(Return(0), n => Return(n + 1)).extract() === 1);
      assert(Maybe.bind(Return(0))(n => Return(n + 1)).extract() === 1);
    });

    it('guard', () => {
      assert(Just(0).guard(true).extract(() => 1) === 0);
      assert(Just(0).guard(false).extract(() => 1) === 1);
      assert(Nothing.guard(true).extract(() => 1) === 1);
      assert(Nothing.guard(false).extract(() => 1) === 1);
    });

    it('join', () => {
      assert(Return(Return(0)).join().extract() === 0);
    });

    it('sequence', async () => {
      assert.deepStrictEqual(Maybe.sequence([Just(0), Just(1)]).extract(), [0, 1]);
      assert.deepStrictEqual(Maybe.sequence([Nothing, Just(1)]).extract(() => [] as number[]), []);
      assert(await Maybe.sequence(Just(Promise.resolve(0))).then(m => m.extract()) === 0);
      assert(await Maybe.sequence(Just(Promise.reject(1))).catch(b => b) === 1);
      assert(await Maybe.sequence(Nothing) === Nothing);
    });

    it('do', () => {
      assert(3 === Maybe.do(function* () {
        const n = yield Just(1);
        const m = yield Just(2);
        return Just(n + m);
      }).extract());
      assert(0 === Maybe.do(function* () {
        yield Nothing;
      }).extract(() => 0));
    });

    it('Monad law 1', () => {
      const f = (n: number) => Return(n + 1);
      const x = 0;
      const ma = Return(x).bind(f);
      const mb = f(x);
      assert(ma.extract() === mb.extract());
    });

    it('Monad law 2', () => {
      const x = 0;
      const ma = Return(x);
      const mb = ma.bind(Return);
      assert(ma.extract() === mb.extract());
    });

    it('Monad law 3', () => {
      const f = (n: number) => Return(n + 2);
      const g = (n: number) => Return(n * 3);
      const x = 1;
      const ma = Return(x)
        .bind(f)
        .bind(g);
      const mb = Return(x)
        .bind(x =>
          f(x)
            .bind(g));
      assert(ma.extract() === mb.extract());
    });

  });

  describe('MonadPlus', () => {
    it('mplus', () => {
      const m = Return(0).bind(() => throwError(''));
      Maybe.mplus(m, m);
    });

    it('MonadPlus law 1', () => {
      assert(Maybe.mplus(Maybe.mzero, Return(0)).extract() === 0);
    });

    it('MonadPlus law 2', () => {
      assert(Maybe.mplus(Return(0), Maybe.mzero).extract() === 0);
    });

    it('MonadPlus law 3', () => {
      Sequence.from([1, 2, 4])
        .mapM(n => Sequence.from<Maybe<number>>([Return(n), Maybe.mzero]))
        .extract()
        .forEach(([m, n, o]) => {
          const ma = Maybe.mplus(m, Maybe.mplus(n, o));
          const mb = Maybe.mplus(Maybe.mplus(m, n), o);
          assert(ma.extract(() => -1) === mb.extract(() => -1));
        });
    });

    it('MonadPlus law add 1', () => {
      const f = (n: number) => Return(n + 1);
      const ma = Maybe.mzero;
      const mb = Maybe.mzero.bind(f);
      assert(ma.extract(() => -1) === mb.extract(() => -1));
    });

    it('MonadPlus law add 2', () => {
      const k = (n: number) => Return(n * 10);
      Sequence.from([1, 2])
        .mapM(n => Sequence.from<Maybe<number>>([Return(n), Maybe.mzero]))
        .extract()
        .forEach(([m, n]) => {
          const ma = Maybe.mplus(m, n).bind(k);
          const mb = Maybe.mplus(m.bind(k), n.bind(k));
          assert(ma.extract(() => -1) === mb.extract(() => -1));
        });
    });

  });

});
