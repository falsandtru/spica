import { Either, Left, Right } from './either';

describe('Unit: lib/either', () => {
  const Return = Either.Return;

  function throwError(msg: string): never {
    throw new Error(msg);
  }

  describe('Either', () => {
    it('Left', () => {
      const result = Return(0)
        .bind(n => Right(n + 1))
        .bind(n => Right(n + 1).bind(n => Left(`Left ${n}`)))
        .bind(n => Right(`Right ${n}`))
        .extract(l => `Left ${l}`);
      assert(result === 'Left Left 2');
    });

    it('Left nest', () => {
      const result = Return(Return(''))
        .bind(m => m.bind(_ => Left(NaN)).bind(throwError))
        .bind(throwError)
        .extract(_ => 'Nothing');
      assert(result === 'Nothing');
    });

    it('Right', () => {
      const result = Return(0)
        .bind(n => Right(n + 1))
        .bind(n => Right(n + 1).bind(n => Right(`Right ${n}`)))
        .extract(l => `Left ${l}`);
      assert(result === 'Right 2');
    });

    it('Right nest', () => {
      const result = Return(Return(0))
        .bind(m => Right(m))
        .bind(m => m.bind(n => Right(n + 1)).bind(n => Right(`Right ${n}`)))
        .extract(_ => 'Nothing');
      assert(result === 'Right 1');
    });

    it('Either', () => {
      const result = Return(0)
        .bind<number, number>(n => <Right<number> | Left<number> | Either<number, number>>Right(n).bind(n => <Right<number> | Left<number>>Right(n) || Left(0)))
        .bind(n => <Right<number> | Left<number> | Either<number, number>>Right(n).bind(n => <Right<number> | Left<number>>Right(n) || Left(0)))
        .extract(n => n + '');
      assert(result === 0);
    });

    it('either', () => {
      assert(Right(0).extract(() => -1, n => n + 1) === 1);
      assert(Left(0).extract(n => n -1, _ => 0 + 1) === -1);
    });

    it('Call-by-need and Memoize', () => {
      let n = NaN;
      const m1 = Return(NaN)
        .bind(_ => Right(++n));
      const m2 = m1
        .bind(_ => Right(++n));
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
      assert(Either.fmap(Return(0), n => n + 1).extract() === 1);
      assert(Either.fmap(Return(0))(n => n + 1).extract() === 1);
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
        Either.pure((a: number) => a)
          .ap(Either.pure(1))
          .extract(),
        1);
      assert.strictEqual(
        Either.pure<number, typeof throwError>(throwError)
          .ap(Left(0))
          .extract(n => n + 1),
        1);
    });

    it('ap 2', () => {
      assert.strictEqual(
        Either.pure((a: number, b: number) => a + b)
          .ap(Either.pure(1))
          .ap(Either.pure(2))
          .extract(),
        3);
    });

    it('ap 3', () => {
      assert.strictEqual(
        Either.pure((a: number, b: number, c: number) => a + b + c)
          .ap(Either.pure(1))
          .ap(Either.pure(2))
          .ap(Either.pure(3))
          .extract(),
        6);
    });

  });

  describe('Monad', () => {
    it('bind', () => {
      assert(Either.bind(Return(0), n => Return(n + 1)).extract() === 1);
      assert(Either.bind(Return(0))(n => Return(n + 1)).extract() === 1);
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

});
