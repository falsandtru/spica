import {Cancelable} from './cancelable';

describe('Unit: lib/cancelable', () => {
  describe('Cancelable', () => {
    it('promise', done => {
      const cancelable = new Cancelable();
      Promise.resolve(0)
        .then(n => cancelable.promise(++n))
        .then(n => ++n)
        .then(cancelable.promise)
        .then(n => (cancelable.cancel(n), ++n))
        .then(_ => NaN)
        .then(_ => cancelable.promise(NaN))
        .then(_ => NaN)
        .catch(n => assert(++n === 3) || done());
    });

    it('maybe', () => {
      const cancelable = new Cancelable();
      assert(cancelable.maybe(1).extract() === 1);
      cancelable.cancel(NaN);
      assert(cancelable.maybe(1).extract(() => 0) === 0);
    });

    it('either', () => {
      const cancelable = new Cancelable<number>();
      assert(cancelable.either(1).extract() === 1);
      cancelable.cancel(NaN);
      assert(cancelable.either(1).extract(n => (assert(Number.isNaN(n)), 0)) === 0);
    });

    it('listeners', done => {
      let cnt = 0;
      const cancelable = new Cancelable<number>();
      cancelable.listeners.add(n => (
        assert(++cnt === 1),
        assert(n === 0)));
      cancelable.cancel(0);
      cancelable.listeners.add(n => (
        assert(++cnt === 2),
        assert(n === 0),
        done()));
    });

  });

});
