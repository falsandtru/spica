import { Cancellation } from './cancellation';

describe('Unit: lib/cancellation', () => {
  describe('Cancellation', () => {
    it('promise', done => {
      const cancellation = new Cancellation();
      Promise.resolve(0)
        .then(n => cancellation.promise(++n))
        .then(n => ++n)
        .then(cancellation.promise)
        .then(n => (cancellation.cancel(n), ++n))
        .then(_ => NaN)
        .then(_ => cancellation.promise(NaN))
        .then(_ => NaN)
        .catch(n => assert(++n === 3) || done());
    });

    it('maybe', () => {
      const cancellation = new Cancellation();
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

    it('listeners', done => {
      let cnt = 0;
      const cancellation = new Cancellation<number>();
      cancellation.listeners.add(n => (
        assert(++cnt === 1),
        assert(n === 0)));
      cancellation.cancel(0);
      cancellation.listeners.add(n => (
        assert(++cnt === 2),
        assert(n === 0),
        done()));
    });

  });

});
