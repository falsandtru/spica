import { Cancellation } from './cancellation';

describe('Unit: lib/cancellation', () => {
  describe('Cancellation', () => {
    it('cancel', done => {
      let cnt = 0;
      const cancellation = new Cancellation<number>();
      cancellation.register(n => (
        assert(++cnt === 1),
        assert(n === 0)));
      cancellation.cancel(0);
      cancellation.cancel(NaN);
      cancellation.register(n => (
        assert(++cnt === 2),
        assert(n === 0),
        done()));
      cancellation.cancel(NaN);
    });

    it('close', done => {
      const cancellation = new Cancellation();
      cancellation.register(() =>
        done(false));
      cancellation.close();
      cancellation.close();
      cancellation.cancel();
      cancellation.register(() =>
        done(false));
      cancellation.close();
      done();
    });

    it('link', done => {
      let cnt = 0;
      const a = new Cancellation();
      const b = new Cancellation([a]);
      const c = new Cancellation([b]);
      a.register(() => done(false));
      b.register(() => assert(cnt === 1 && ++cnt));
      c.register(() => assert(cnt === 0 && ++cnt));
      b.cancel();
      assert(a.canceled === false);
      assert(b.canceled === true);
      assert(c.canceled === true);
      assert(cnt === 2);
      done();
    });

    it('promise', done => {
      const cancellation = new Cancellation<number>();
      Promise.resolve(0)
        .then(n => cancellation.promise(++n))
        .then(n => ++n)
        .then(n => cancellation.promise(n))
        .then(n => (cancellation.cancel(n), ++n))
        .then(_ => NaN)
        .then(_ => cancellation.promise(NaN))
        .then(_ => NaN)
        .catch(n => assert(++n === 3) || done());
    });

    it('maybe', () => {
      const cancellation = new Cancellation<number>();
      assert(cancellation.maybe(1).extract() === 1);
      cancellation.cancel(NaN);
      assert(cancellation.maybe(1).extract(() => 0) === 0);
    });

    it('either', () => {
      const cancellation = new Cancellation<number>();
      assert(cancellation.either(1).extract() === 1);
      cancellation.cancel(NaN);
      assert(cancellation.either(1).extract(n => (assert(Number.isNaN(n)), 0)) === 0);
    });

  });

});
