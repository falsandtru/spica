import {Sequence} from './sequence';

describe('Unit: lib/monad/sequence', () => {
  describe('Sequence', () => {
    it('Monoid law 1', () => {
      const x = Sequence.Return(0);
      const ma = Sequence.mappend(Sequence.mempty, x);
      assert.deepStrictEqual(ma.read(), x.read());
    });

    it('Monoid law 2', () => {
      const x = Sequence.Return(0);
      const ma = Sequence.mappend(x, Sequence.mempty);
      assert.deepStrictEqual(ma.read(), x.read());
    });

    it('Monoid law 3', () => {
      const x = Sequence.Return(0);
      const y = Sequence.Return(1);
      const z = Sequence.Return(2);
      const ma = Sequence.mappend(Sequence.mappend(x, y), z);
      const mb = Sequence.mappend(x, Sequence.mappend(y, z));
      assert.deepStrictEqual(ma.read(), mb.read());
    });

    it('Functor law 1', () => {
      const f = <T>(n: T) => n;
      const x = 0;
      const fa = Sequence.Return(x).fmap(f);
      const fb = f(Sequence.Return(x));
      assert.deepStrictEqual(fa.read(), fb.read());
    });

    it('Functor law 2', () => {
      const f = (n: number) => n + 2;
      const g = (n: number) => n * 3;
      const x = 1;
      const fa = Sequence.Return(x).fmap(n => g(f(n)));
      const fb = Sequence.Return(x).fmap(f).fmap(g);
      assert.deepStrictEqual(fa.read(), fb.read());
    });

    it('Monad law 1', () => {
      const f = (n: number) => Sequence.Return(n + 1);
      const x = 0;
      const ma = Sequence.Return(x).bind(f);
      const mb = f(x);
      assert.deepStrictEqual(ma.read(), mb.read());
    });

    it('Monad law 2', () => {
      const f = (n: number) => Sequence.Return(n + 1);
      const x = 0;
      const ma = Sequence.Return(x);
      const mb = ma.bind(Sequence.Return);
      assert.deepStrictEqual(ma.read(), mb.read());
    });

    it('Monad law 3', () => {
      const m1 = Sequence.Return(1);
      const m2 = Sequence.Return(2);
      const m3 = Sequence.Return(4);
      const ma = m1
        .bind(v1 => m2.bind(v2 => Sequence.Return(v1 + v2)))
        .bind(n => m3.bind(v3 => Sequence.Return(n + v3)));
      const mb = m1
        .bind(v1 => m2.bind(v2 => m3.bind(v3 =>
          Sequence.Return(v2 + v3)))
            .bind(n =>
              Sequence.Return(v1 + n)));
      assert.deepStrictEqual(ma.read(), mb.read());
    });

  });

});
