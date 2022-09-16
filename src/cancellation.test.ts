import { Cancellation } from './cancellation';

describe('Unit: lib/cancellation', () => {
  describe('Cancellation', () => {
    it('cancel', done => {
      let cnt = 0;
      const cancellation = new Cancellation<number>();
      const unregister = cancellation.register(n => {
        assert(cnt === 0 && ++cnt);
        assert(n === 0);
        assert(cancellation.isAlive() === false);
        assert(cancellation.isCancelled() === true);
        assert(cancellation.isClosed() === false);
        unregister();
        cancellation.register(n => {
          assert(cnt === 2 && ++cnt);
          assert(n === 0);
        });
        unregister();
      });
      cancellation.register(n => {
        assert(cnt === 1 && ++cnt);
        assert(n === 0);
      });
      cancellation.register(cancellation.register(() => {
        done(false);
      }));
      cancellation.then(reason => {
        assert(cnt === 3 && ++cnt);
        assert(reason === 0);
        assert(cancellation.isAlive() === false);
        assert(cancellation.isCancelled() === true);
        assert(cancellation.isClosed() === false);
        done();
      });
      assert(cancellation.isAlive() === true);
      assert(cancellation.isCancelled() === false);
      assert(cancellation.isClosed() === false);
      cancellation.cancel(0);
      cancellation.cancel(NaN);
    });

    it('close', done => {
      const cancellation = new Cancellation();
      cancellation.register(() =>
        done(false));
      assert(cancellation.isAlive() === true);
      assert(cancellation.isCancelled() === false);
      assert(cancellation.isClosed() === false);
      cancellation.close();
      assert(cancellation.isAlive() === false);
      assert(cancellation.isCancelled() === false);
      assert(cancellation.isClosed() === true);
      cancellation.close();
      assert(cancellation.isAlive() === false);
      assert(cancellation.isCancelled() === false);
      assert(cancellation.isClosed() === true);
      cancellation.cancel();
      assert(cancellation.isAlive() === false);
      assert(cancellation.isCancelled() === false);
      assert(cancellation.isClosed() === true);
      cancellation.register(() =>
        done(false));
      assert(cancellation.isAlive() === false);
      assert(cancellation.isCancelled() === false);
      assert(cancellation.isClosed() === true);
      cancellation.close();
      assert(cancellation.isAlive() === false);
      assert(cancellation.isCancelled() === false);
      assert(cancellation.isClosed() === true);
      cancellation.catch(done);
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
      assert(a.isAlive() === true);
      assert(a.isCancelled() === false);
      assert(a.isClosed() === false);
      assert(b.isAlive() === false);
      assert(b.isCancelled() === true);
      assert(a.isClosed() === false);
      assert(c.isAlive() === false);
      assert(c.isCancelled() === true);
      assert(a.isClosed() === false);
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
        .then(() => NaN)
        .then(() => cancellation.promise(NaN))
        .then(() => NaN)
        .catch(n => void assert(++n === 3) || done());
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
