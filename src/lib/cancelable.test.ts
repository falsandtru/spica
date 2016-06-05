import {Cancelable} from './cancelable';

describe('Unit: lib/cancelable', () => {
  describe('cancelable', () => {
    it('promise', done => {
      const cancelable = new Cancelable();
      Promise.resolve(0)
        .then(n => cancelable.promise(++n))
        .then(n => ++n)
        .then(cancelable.promise)
        .then(n => (cancelable.cancel(n), ++n))
        .then(n => NaN)
        .then(n => cancelable.promise(NaN))
        .then(n => NaN)
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
      assert(cancelable.either(1).extract(n => (assert(isNaN(n)), 0)) === 0);
    });

  });

});
