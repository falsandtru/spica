import { Cancellation } from './cancellation';

describe('Unit: lib/cancellation', () => {
  describe('Cancellation', () => {
    it('cancel', done => {
      let cnt = 1;
      const cancellation = new Cancellation<number>();
      const unregister = cancellation.register(n => {
        assert(cnt === 1 && ++cnt);
        assert(n === 0);
        unregister();
        cancellation.register(n => {
          assert(cnt === 3 && ++cnt);
          assert(n === 0);
        });
        unregister();
      });
      cancellation.register(n => {
        assert(cnt === 2 && ++cnt);
        assert(n === 0);
      });
      cancellation.register(cancellation.register(() => {
        done(false);
      }));
      cancellation.then(reason => {
        assert(cnt === 4 && ++cnt);
        assert(reason === 0);
        done();
      });
      cancellation.cancel(0);
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
