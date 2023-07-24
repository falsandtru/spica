import { Either, Left, Right } from './either';

describe('Unit: lib/monad/either', () => {
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
      try {
        Left(0).extract();
        throw 1;
      }
      catch (reason) {
        assert(reason === 0);
      }
    });

    it('Left nest', () => {
      const result = Return(Return(''))
        .bind(m => m.bind(() => Left(NaN)).bind(throwError))
        .bind(throwError)
        .extract(() => 'Nothing');
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
        .extract(() => 'Nothing');
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
      assert(Left(0).extract(n => n -1, () => 0 + 1) === -1);
    });

    it('Call-by-need and Memoize', () => {
      let n = NaN;
      const m1 = Return(NaN)
        .bind(() => Right(++n));
      const m2 = m1
        .bind(() => Right(++n));
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
      assert(Either.fmap(n => n + 1, Return(0)).extract() === 1);
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
          .extract(n => n),
        0);
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
      assert(Either.bind(n => Return(n + 1), Return(0)).extract() === 1);
    });

    it('join', () => {
      assert(Return(Return(0)).join().extract() === 0);
    });

    it('sequence', async () => {
      assert.deepStrictEqual(Either.sequence([Right(0), Right(1)]).extract(), [0, 1]);
      assert.deepStrictEqual(Either.sequence([Left([]), Right(1)]).extract(a => a), []);
      assert(await Either.sequence(Right(Promise.resolve(0))).then(m => m.extract()) === 0);
      assert(await Either.sequence(Right(Promise.reject(1))).catch(a => a) === 1);
      assert(await Either.sequence(Left(1)).then(m => m.extract(a => a)) === 1);
    });

    it('do', () => {
      assert(3 === Either.do<number>(function* () {
        const n = yield Right(1);
        const m = yield Right(2);
        return Right(n + m);
      }).extract());
      // @ts-ignore #32728
      assert(0 === Either.do(function* () {
        yield Left(0);
        return Right(1);
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

});
