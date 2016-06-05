import {Return, Left, Right, Either} from './either';

describe('Unit: lib/either', () => {
  function throwError(): any {
    throw new Error();
  }

  describe('Either', () => {
    it('Either object', () => {
      assert(Either.Return === Return);
      assert(Either.Left === Left);
      assert(Either.Right === Right);
    });

    it('Either type', () => {
      const left: Either<Error, number> = Left<Error>(new Error());
      const right: Either<Error, number> = Right<number>(0);
      const either: Either<Error, number> = Right(0).bind<Error>(n => Right(n) || Left(new Error()));
    });

    it('Left type', () => {
      const left: Left<Error> = Left<Error>(new Error());
    });

    it('Left', () => {
      const result = Return(0)
        .bind(n => Right(n + 1))
        .bind(n => Right(n + 1).bind(n => Left(`Left ${n}`)))
        .bind(n => Right(`Right ${n}`))
        .extract(l => `Left ${l}`);
      assert(result === 'Left Left 2');
    });

    it('Left nest', () => {
      const result = Return(Return(0))
        .bind(m => m.bind(n => Left(NaN)).bind(throwError))
        .bind(throwError)
        .extract(_ => 'Nothing');
      assert(result === 'Nothing');
    });

    it('Right type', () => {
      const right: Right<number> = Right(0);
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
        .bind<number>(n => Right(n) || Left(0) || Right(n).bind(n => Right(n) || Left(0)))
        .bind<number>(n => Right(n) || Left(0) || Right(n).bind(n => Right(n) || Left(0)))
        .extract((n) => n + '');
      assert(result === 0);
    });

    it('Functor law 1', () => {
      const f = (n: number) => n,
            x = 0;
      const fa = Return(x).fmap(f);
      assert(fa.extract() === 0);
    });

    it('Functor law 2', () => {
      const f = (n: number) => n + 2,
            g = (n: number) => n * 3,
            x = 1;
      const fa = Return(x).fmap(n => g(f(n))),
            fb = Return(x).fmap(f).fmap(g);
      assert(fa.extract() === fb.extract());
    });

    it('Monad law 1', () => {
      const f = (n: number) => Right(n + 1),
            x = 0;
      const ma = Return(x).bind(f);
      const mb = f(x);
      assert(ma.extract() === mb.extract());
    });

    it('Monad law 2', () => {
      const f = (n: number) => Right(n + 1),
            x = 0;
      const ma = Return(x);
      const mb = ma.bind(Return);
      assert(ma.extract() === mb.extract());
    });

    it('Monad law 3', () => {
      let ord1 = 0,
          ord2 = 0;
      const m1 = Return(1),
            m2 = Return(2),
            m3 = Return(4);
      const ma = m1
        .bind(v1 => m2.bind(v2 => Right(+assert(++ord1 === 1) || v1 + v2)))
        .bind(n => m3.bind(v3 => Right(+assert(++ord1 === 2) || n + v3)));
      const mb = m1
        .bind(v1 => m2.bind(v2 => m3.bind(v3 =>
          Right(+assert(++ord2 === 1) || v2 + v3)))
            .bind(n =>
              Right(+assert(++ord2 === 2) || v1 + n)));
      assert(ma.extract() === mb.extract());
    });

    it('Call-by-need and Memoize', () => {
      let n = 0;
      const m1 = Return(0)
        .bind(_ => Right(++n));
      const m2 = m1
        .bind(_ => Right(++n));
      assert(m2.extract() === 2);
      assert(m2.extract() === 2);
      assert(m2.extract() === 2);
      assert(m1.extract() === 1);
      assert(m1.extract() === 1);
      assert(m1.extract() === 1);
    });

  });

});
